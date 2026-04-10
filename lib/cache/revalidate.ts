import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema/catalog";

/**
 * Cache invalidation helpers for admin mutations.
 *
 * Every admin mutation endpoint imports the helper(s) it needs and calls
 * them after a successful write. Helpers are thin wrappers over
 * `revalidateTag(tag, { expire: 0 })` — the `{ expire: 0 }` form is the
 * documented pattern for webhook/API-route immediate invalidation in
 * Next.js 16. See:
 * node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md
 *
 * Cache tags emitted here must stay in sync with the `cacheTag(...)` calls
 * inside the cached pages under `app/(store)/`.
 */

const IMMEDIATE = { expire: 0 } as const;

// ─── Product ────────────────────────────────────────────────────────────

/**
 * Invalidate everything tied to a single product by its slug.
 * Also flushes list/search/homepage because any product change can
 * affect listings, search results, and the new-arrivals carousel.
 */
export function invalidateProductBySlug(slug: string): void {
  revalidateTag(`product-${slug}`, IMMEDIATE);
  revalidateTag("collection-all", IMMEDIATE);
  revalidateTag("search", IMMEDIATE);
  revalidateTag("homepage", IMMEDIATE);
}

/**
 * Invalidate a product when the caller only has its id.
 * Does a minimal `SELECT slug` lookup, then delegates to
 * `invalidateProductBySlug`. If the row is missing (already deleted
 * or bad id), falls back to a list-level flush.
 */
export async function invalidateProductById(id: string): Promise<void> {
  const [row] = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (row) {
    invalidateProductBySlug(row.slug);
  } else {
    invalidateProductList();
  }
}

/**
 * Invalidate the product-listing surfaces without targeting any
 * specific product. Use for create endpoints where there's no old
 * slug to flush, or for bulk operations.
 */
export function invalidateProductList(): void {
  revalidateTag("collection-all", IMMEDIATE);
  revalidateTag("search", IMMEDIATE);
}

// ─── Category ───────────────────────────────────────────────────────────

/**
 * Invalidate a single category page by slug. Also flushes
 * `collection-all` because the category index shows counts.
 */
export function invalidateCategoryBySlug(slug: string): void {
  revalidateTag(`collection-${slug}`, IMMEDIATE);
  revalidateTag("collection-all", IMMEDIATE);
}

/**
 * Invalidate a category when the caller only has its id.
 */
export async function invalidateCategoryById(id: string): Promise<void> {
  const [row] = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (row) {
    invalidateCategoryBySlug(row.slug);
  } else {
    invalidateCategoryList();
  }
}

export function invalidateCategoryList(): void {
  revalidateTag("collection-all", IMMEDIATE);
}

// ─── Global surfaces ────────────────────────────────────────────────────

export function invalidateHomepage(): void {
  revalidateTag("homepage", IMMEDIATE);
}

export function invalidateStoreLayout(): void {
  revalidateTag("store-layout", IMMEDIATE);
}

export function invalidateFlashSales(): void {
  revalidateTag("flash-sales", IMMEDIATE);
}

/**
 * Invalidate a static info page by its key (e.g. "about", "privacy").
 * Currently defensive — the cached static pages use hardcoded metadata
 * exports, so this is a no-op today. Wired so the SEO pages endpoint
 * stays correct if static pages ever migrate to DB-backed metadata.
 */
export function invalidateStaticPage(key: string): void {
  revalidateTag(`static-${key}`, IMMEDIATE);
}
