import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productSeo, categorySeo, staticPageSeo, urlRedirects, sitemapEntries } from '@/lib/db/schema/seo';
import { NotFoundError, ConflictError } from '@/lib/errors/api-error';

// ── Product SEO ──────────────────────────────────────────────────
export async function getProductSeo(productId: string) {
  const [seo] = await db.select().from(productSeo).where(eq(productSeo.productId, productId)).limit(1);
  return seo ?? null;
}

export async function upsertProductSeo(productId: string, input: Record<string, unknown>) {
  const existing = await getProductSeo(productId);
  if (existing) {
    const [updated] = await db.update(productSeo).set({ ...input, updatedAt: new Date() }).where(eq(productSeo.productId, productId)).returning();
    return updated;
  }
  const [created] = await db.insert(productSeo).values({ productId, ...input }).returning();
  return created;
}

// ── Category SEO ─────────────────────────────────────────────────
export async function getCategorySeo(categoryId: string) {
  const [seo] = await db.select().from(categorySeo).where(eq(categorySeo.categoryId, categoryId)).limit(1);
  return seo ?? null;
}

export async function upsertCategorySeo(categoryId: string, input: Record<string, unknown>) {
  const existing = await getCategorySeo(categoryId);
  if (existing) {
    const [updated] = await db.update(categorySeo).set({ ...input, updatedAt: new Date() }).where(eq(categorySeo.categoryId, categoryId)).returning();
    return updated;
  }
  const [created] = await db.insert(categorySeo).values({ categoryId, ...input }).returning();
  return created;
}

// ── Static Page SEO ──────────────────────────────────────────────
export async function getStaticPageSeo(pageKey: string) {
  const [seo] = await db.select().from(staticPageSeo).where(eq(staticPageSeo.pageKey, pageKey)).limit(1);
  return seo ?? null;
}

export async function upsertStaticPageSeo(pageKey: string, input: Record<string, unknown>) {
  const existing = await getStaticPageSeo(pageKey);
  if (existing) {
    const [updated] = await db.update(staticPageSeo).set({ ...input, updatedAt: new Date() }).where(eq(staticPageSeo.pageKey, pageKey)).returning();
    return updated;
  }
  const [created] = await db.insert(staticPageSeo).values({ pageKey, ...input }).returning();
  return created;
}

// ── URL Redirects ────────────────────────────────────────────────
export async function listRedirects() {
  return db.select().from(urlRedirects).where(eq(urlRedirects.isActive, true));
}

export async function createRedirect(fromPath: string, toPath: string, redirectType: number = 301) {
  // Check circular redirect
  const [circular] = await db.select().from(urlRedirects).where(eq(urlRedirects.fromPath, toPath)).limit(1);
  if (circular) throw new ConflictError('Circular redirect detected');

  const [redirect] = await db.insert(urlRedirects).values({ fromPath, toPath, redirectType }).returning();
  return redirect;
}

// ── Sitemap ──────────────────────────────────────────────────────
export async function getSitemapEntries() {
  return db.select().from(sitemapEntries).where(eq(sitemapEntries.isExcluded, false));
}

export async function generateSitemapXml(): Promise<string> {
  const entries = await getSitemapEntries();
  const urls = entries.map((e) => `
  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastModified ? new Date(e.lastModified).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>${e.changeFreq ?? 'weekly'}</changefreq>
    <priority>${e.priority ?? '0.5'}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}
