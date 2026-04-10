# Storefront caching

Next.js 16 Cache Components gives the storefront Shopify-style full-page caching: every public route serves a pre-rendered HTML + RSC shell with per-entry tags, and admin mutations invalidate those tags the moment a write succeeds.

This doc is a map, not a tutorial. Read the linked source files for the actual code.

---

## Why

The storefront must hit a **92+ mobile Lighthouse budget**. Querying Neon on every request blows the TTFB. Caching the rendered output per-route (keyed by params + searchParams) lets the CDN serve most traffic from a static shell, and tag-based invalidation keeps content fresh after admin edits without waiting for a TTL.

---

## The big picture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STOREFRONT                               │
│                                                                 │
│  app/(store)/layout.tsx       ──── 'use cache' + store-layout   │
│    ├── app/(store)/page.tsx   ──── 'use cache' + homepage       │
│    ├── app/(store)/products/[slug]/page.tsx                     │
│    │     └── 'use cache' + product-${slug}                      │
│    └── ... every other public page                              │
└────────────────────┬────────────────────────────────────────────┘
                     │ read
                     ▼
              ┌──────────────┐
              │  Neon (DB)   │
              └──────▲───────┘
                     │ write
                     │
┌────────────────────┴────────────────────────────────────────────┐
│                        ADMIN                                    │
│                                                                 │
│  app/api/v1/admin/products/[id]/route.ts  PATCH                 │
│       ├─► updateProduct(id, data)                               │
│       └─► invalidateProductBySlug(slug)  ← from lib/cache       │
│              └─► revalidateTag('product-...', { expire: 0 })    │
└─────────────────────────────────────────────────────────────────┘
```

**Services stay pure.** Invalidation lives in route handlers, never inside `lib/services/*.service.ts`, so seeders and scripts can call services outside a request context.

---

## Prerequisite: `cacheComponents: true`

`next.config.ts` enables Cache Components globally. Without this, `'use cache'` throws at build time and the whole system falls apart.

This flag has a knock-on effect: every component that reads runtime APIs (`cookies()`, `headers()`, `searchParams`) must either be wrapped in `<Suspense>` or call `await connection()` to opt out of prerendering. Relevant fixes:

- `app/(admin)/admin/(dashboard)/layout.tsx` wraps its `requireAdmin()` call in `<Suspense>` so the sidebar skeleton can prerender while auth streams in
- `lib/auth/index.ts` — `getCurrentUser` and `requireAdmin` each call `await connection()` once; this centrally fixes ~68 downstream API routes that read auth
- `/api/v1/search`, `/api/v1/products`, `/api/v1/checkout/delivery-zones` call `await connection()` because they read `searchParams` directly

If you add a new route that reads request-time data outside a cached scope, use the same pattern.

---

## Cache tag registry

| Tag | Applied in | Invalidated by |
|---|---|---|
| `store-layout` | `app/(store)/layout.tsx` | Nav menu create/update/delete, category create/update |
| `homepage` | `app/(store)/page.tsx` | Banner CRUD, product CRUD, category create/update |
| `product-${slug}` | `app/(store)/products/[slug]/page.tsx` (+ `generateMetadata`) | Product update, product images/variants/inventory CRUD, review moderation, flash-sale product link, product SEO update |
| `collection-all` | `app/(store)/products/page.tsx`, `app/(store)/categories/page.tsx` | Any product or category mutation |
| `collection-${slug}` | `app/(store)/categories/[slug]/page.tsx` (+ `generateMetadata`) | Category update, category SEO update |
| `search` / `search-${q}` | `app/(store)/search/page.tsx`, `app/(store)/products/page.tsx` (when `?q=`) | Any product mutation |
| `flash-sales` | `app/(store)/flash-sales/page.tsx` | Flash sale CRUD, flash sale product link/unlink |
| `static-about`, `static-contact`, `static-privacy`, `static-terms`, `static-shipping`, `static-returns-policy` | individual static pages | Static page SEO update (defensive — static pages currently use hardcoded metadata) |

When adding a new tag, **update this table and the helper module together**.

---

## Adding a new cached page

1. Decide the `cacheLife` profile: `'minutes'` for time-sensitive content, `'hours'` for stable product data, `'max'` for truly static pages.
2. Decide the tag name. Format: singular-noun + hyphen + identifier (`product-${slug}`).
3. Put the caching inside the page body. For pages with `params` or `searchParams`, read them **outside** the cached scope and pass primitives into an inner cached function — runtime APIs can't be called inside `'use cache'`:

```tsx
export default async function SomePage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  return <SomeContent slug={slug} page={page} />;
}

async function SomeContent({ slug, page }: { slug: string; page: number }) {
  'use cache';
  cacheLife('minutes');
  cacheTag(`collection-${slug}`);
  // ...fetch and render
}
```

4. Add the tag to the registry above.
5. Wire the relevant admin mutation endpoint(s) to invalidate it (next section).

**Gotchas:**
- If you use file-level `'use cache'` (at the top of the file), every export must be an async function. Prefer function-level.
- Page-level caching only captures what's inside `page.tsx`. Layout chrome needs its own `'use cache'` directive in `layout.tsx`.
- `notFound()` and `redirect()` throw, they don't read runtime state — safe inside cached scopes.
- Client components pass through cached scopes cleanly as `children` slots; their hydration happens on the client regardless.

---

## Wiring a new admin mutation

Source: `lib/cache/revalidate.ts` — import only what you need and call after a successful write.

**The helper API:**

```ts
// By slug (caller already has it, e.g. from update() return value)
invalidateProductBySlug(slug: string)      // also flushes collection-all, search, homepage
invalidateCategoryBySlug(slug: string)     // also flushes collection-all

// By id (does a SELECT slug lookup, falls back to list flush on miss)
invalidateProductById(id: string)   // async
invalidateCategoryById(id: string)  // async

// Bulk / global
invalidateProductList()       // collection-all + search
invalidateCategoryList()      // collection-all
invalidateHomepage()
invalidateStoreLayout()
invalidateFlashSales()
invalidateStaticPage(key)     // static-${key}
```

**Pattern for an update endpoint where the slug can change:**

```ts
// app/api/v1/admin/products/[id]/route.ts
import { invalidateProductBySlug, invalidateHomepage } from '@/lib/cache/revalidate';
import { getProductById, updateProduct } from '@/lib/services/product.service';

export async function PATCH(request, { params }) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id } = await params;
    const data = updateProductSchema.parse(await request.json());

    // Fetch old slug BEFORE mutating — updateProduct regenerates the slug
    // on rename, so we need to flush the old URL as well.
    const before = await getProductById(id);
    const product = await updateProduct(id, data);

    invalidateProductBySlug(before.slug);
    if (product.slug !== before.slug) {
      invalidateProductBySlug(product.slug);
    }
    invalidateHomepage();

    return success(product);
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Pattern for a sub-resource endpoint that only has `productId` in params** (images, variants, inventory, reviews, SEO):

```ts
await invalidateProductById(id);  // does the lookup for you
```

**Do NOT** put `revalidateTag` calls inside service functions — services get called from seeders and scripts that run outside a request context, and `revalidateTag` will fail there. Keep invalidation in the route handler.

---

## What is explicitly NOT cached

- `app/(store)/account/**` — user-specific, always dynamic
- `app/(store)/checkout/**` — cart state is client-side, always dynamic
- `app/(store)/auth/**` — form pages
- `app/(admin)/**` — admin reads must always reflect the latest database state; admin shell uses `<Suspense>` for streaming but no `'use cache'`
- All API routes (`app/api/**`) — including the revalidate webhook; API responses are not cached
- User-specific services: `cart.service.ts`, `order.service.ts`, `wishlist.service.ts`, `loyalty.service.ts`, `return.service.ts`, `user.service.ts`
- `inventory.service.ts` — stock must be real-time
- `coupon.service.ts::validateCoupon` — reads mutable usage counters

---

## `/api/revalidate` — webhook endpoint

`app/api/revalidate/route.ts` is an HTTP wrapper around the same helpers, intended for **external callers** (webhooks, cron jobs, third-party integrations). In-process admin mutations should call the helpers directly, not hit this endpoint.

- **POST only.** GETs are rejected — a leaked URL should not be a cache flush weapon.
- **Secret auth** via `x-revalidate-secret` header or `?secret=` query, compared with `crypto.timingSafeEqual`.
- **Body:** `{ tag: string }` or `{ slug: string, type: 'product' | 'collection' | 'homepage' | 'search' | 'static' }`.
- **Required env var:** `REVALIDATION_SECRET` (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Without it set, the route rejects every request with 401 — safe default.

Example call:

```bash
curl -X POST https://your-site.com/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATION_SECRET" \
  -H "content-type: application/json" \
  -d '{"slug":"vintage-tee","type":"product"}'
```

---

## Dev vs production behavior

| Mode | `'use cache'` active? | Caveat |
|---|---|---|
| `npm run dev` | Yes | **Every file save invalidates all cache entries** via Next.js's HMR refresh hash. If you're editing code while testing, don't trust cache hit/miss logs. |
| `npm run build && npm run start` | Yes | Realistic behavior. Static shells pre-rendered at build time, entries persist across requests. Use this to verify caching actually works locally. |
| Vercel production | Yes | Same as above plus Vercel's CDN layer and multi-region tag coordination. |

**To verify caching manually:**

```bash
NEXT_PRIVATE_DEBUG_CACHE=1 npm run dev
```

Hit a product page twice in the browser without editing any code. First request = cache miss, second = cache hit. Then curl a product PATCH via admin, refresh the page, and you should see a cache miss (proving `revalidateTag` fired), then hits again.

---

## Files to know

| Path | What it does |
|---|---|
| `next.config.ts` | `cacheComponents: true` — prerequisite for everything below |
| `app/(store)/layout.tsx` | Cached store chrome (header, footer) |
| `app/(store)/**/page.tsx` | Individual cached pages |
| `lib/cache/revalidate.ts` | Helper module — all invalidation logic lives here |
| `app/api/v1/admin/**/route.ts` | 21 admin endpoints wired to helpers |
| `app/api/revalidate/route.ts` | Webhook endpoint for external callers |
| `app/(admin)/admin/(dashboard)/layout.tsx` | `<Suspense>` wrapper for the auth check — required under Cache Components |
| `lib/auth/index.ts` | Centralized `await connection()` calls for request-time auth reads |

---

## When in doubt

1. If your build breaks with "uncached data accessed outside `<Suspense>`", the file is reading runtime state (cookies/headers/searchParams) somewhere it shouldn't. Fix: wrap it in `<Suspense>`, or add `await connection()` at the top of the handler.
2. If admin edits aren't reflecting on the storefront, grep for the tag name in `lib/cache/revalidate.ts` and confirm it matches the `cacheTag(...)` argument in the corresponding cached page.
3. If you want a page to stay dynamic (never cached), simply don't add `'use cache'` to it. Under Cache Components, the default is dynamic — caching is opt-in.
