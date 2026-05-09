import { revalidateTag } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, categories, productVariants } from "@/lib/db/schema/catalog";

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
  revalidateTag(`category-meta-${slug}`, IMMEDIATE);
  revalidateTag("collection-all", IMMEDIATE);
  revalidateTag("category-nav", IMMEDIATE);
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
  revalidateTag("category-nav", IMMEDIATE);
}

/**
 * Invalidate the category sidebar navigation (all-categories list).
 * Used when any category is created, renamed, reordered, or deleted.
 */
export function invalidateCategoryNav(): void {
  revalidateTag("category-nav", IMMEDIATE);
}

/**
 * Invalidate a single category's metadata (breadcrumbs, section header).
 */
export function invalidateCategoryMeta(slug: string): void {
  revalidateTag(`category-meta-${slug}`, IMMEDIATE);
}

// ─── Global surfaces ────────────────────────────────────────────────────

export function invalidateHomepage(): void {
  revalidateTag("homepage", IMMEDIATE);
}

// ─── Inventory / variant stock ──────────────────────────────────────────

/**
 * Invalidate every storefront surface that filters by variant stock.
 *
 * Storefront grids drop variants whose available stock <= 0
 * (see `listProductVariants` in `lib/services/product.service.ts`), so any
 * inventory mutation that flips a variant in or out of stock must flush:
 *   - `homepage` (new arrivals carousel)
 *   - `collection-all` (/products listing — now per-variant)
 *   - `collection-${categorySlug}` for each affected category
 *   - `product-${productSlug}` for each affected product (PDP stock badge)
 *   - `search` (results may include the variant)
 *
 * Joins variantIds → products → categories in one query so callers don't
 * have to hand the slugs down through service signatures. Pass an empty
 * array for a no-op (cheap guard for routes that may have empty items).
 */
export async function invalidateVariantStock(variantIds: string[]): Promise<void> {
  if (variantIds.length === 0) return;

  const rows = await db
    .select({
      productSlug: products.slug,
      categorySlug: categories.slug,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(inArray(productVariants.id, variantIds));

  // Always flush the global surfaces.
  revalidateTag("collection-all", IMMEDIATE);
  revalidateTag("homepage", IMMEDIATE);
  revalidateTag("search", IMMEDIATE);

  // Per-product + per-category, deduped.
  const productSlugs = new Set(rows.map((r) => r.productSlug));
  const categorySlugs = new Set(rows.map((r) => r.categorySlug));
  for (const slug of productSlugs) {
    revalidateTag(`product-${slug}`, IMMEDIATE);
  }
  for (const slug of categorySlugs) {
    revalidateTag(`collection-${slug}`, IMMEDIATE);
  }
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
