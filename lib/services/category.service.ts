import { cache } from 'react';
import { eq, and, isNull, sql, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema/catalog';
import { products } from '@/lib/db/schema/catalog';
import { navMenuItems } from '@/lib/db/schema/marketing';
import { NotFoundError } from '@/lib/errors/api-error';
import { slugify } from '@/lib/utils/slugify';
import type { CreateCategoryInput } from '@/lib/validators/product.validators';

export async function listCategories() {
  return db.select().from(categories).orderBy(categories.sortOrder);
}

/** Lightweight nav links for header/footer — cached per request.
 *  Reads from admin-managed navMenuItems first; falls back to categories. */
export const getNavCategories = cache(async () => {
  try {
    // Try admin-configured nav items first
    const menuItems = await db
      .select({ label: navMenuItems.label, href: navMenuItems.href })
      .from(navMenuItems)
      .where(eq(navMenuItems.isActive, true))
      .orderBy(navMenuItems.sortOrder);

    if (menuItems.length > 0) return menuItems;

    // Fallback: top categories by sortOrder
    const rows = await db
      .select({ nameEn: categories.nameEn, slug: categories.slug })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.sortOrder)
      .limit(8);

    return rows.map((r) => ({ label: r.nameEn, href: `/categories/${r.slug}` }));
  } catch {
    return [];
  }
});

export async function listCategoriesWithProductCount() {
  const rows = await db
    .select({
      id: categories.id,
      parentId: categories.parentId,
      nameEn: categories.nameEn,
      nameUr: categories.nameUr,
      slug: categories.slug,
      imageUrl: categories.imageUrl,
      isActive: categories.isActive,
      sortOrder: categories.sortOrder,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.isActive, true), eq(products.isPublished, true)))
    .where(eq(categories.isActive, true))
    .groupBy(categories.id)
    .orderBy(desc(sql`count(${products.id})`), categories.sortOrder);

  return rows;
}

/** Categories admins have flagged for the homepage "Ecosystem" bento grid,
 *  ordered by ecosystemOrder (lowest first). Limited to 4 — the grid has 4 slots. */
export async function listEcosystemCategories() {
  return db
    .select({
      id: categories.id,
      parentId: categories.parentId,
      nameEn: categories.nameEn,
      nameUr: categories.nameUr,
      slug: categories.slug,
      imageUrl: categories.imageUrl,
      isActive: categories.isActive,
      sortOrder: categories.sortOrder,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.isActive, true), eq(products.isPublished, true)))
    .where(and(eq(categories.isActive, true), eq(categories.isEcosystemFeatured, true)))
    .groupBy(categories.id)
    .orderBy(categories.ecosystemOrder)
    .limit(4);
}

export async function getCategoryTree() {
  const all = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);

  // Build tree from flat list
  type Cat = typeof all[number] & { children: Cat[] };
  const map = new Map<string, Cat>();
  const roots: Cat[] = [];

  for (const cat of all) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of map.values()) {
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(cat);
    } else {
      roots.push(cat);
    }
  }

  return roots;
}

export async function getCategoryBySlug(slug: string) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!category) throw new NotFoundError('Category not found');
  return category;
}

export async function getCategoryById(id: string) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!category) throw new NotFoundError('Category not found');
  return category;
}

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let suffix = 1;

  while (true) {
    const candidate = suffix === 1 ? slug : `${slug}-${suffix}`;
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, candidate))
      .limit(1);

    if (!existing) return candidate;
    suffix++;
  }
}

export async function createCategory(input: CreateCategoryInput) {
  const slug = await generateUniqueSlug(input.nameEn);

  const [category] = await db
    .insert(categories)
    .values({
      parentId: input.parentId ?? null,
      nameEn: input.nameEn,
      nameUr: input.nameUr ?? null,
      slug,
      imageUrl: input.imageUrl ?? null,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
      isEcosystemFeatured: input.isEcosystemFeatured ?? false,
      ecosystemOrder: input.ecosystemOrder ?? 0,
    })
    .returning();

  return category;
}

export async function updateCategory(id: string, input: Partial<CreateCategoryInput>) {
  const updates: Record<string, unknown> = { ...input };

  // Regenerate slug if name changed
  if (input.nameEn) {
    updates.slug = await generateUniqueSlug(input.nameEn);
  }

  const [category] = await db
    .update(categories)
    .set(updates)
    .where(eq(categories.id, id))
    .returning();

  if (!category) throw new NotFoundError('Category not found');
  return category;
}
