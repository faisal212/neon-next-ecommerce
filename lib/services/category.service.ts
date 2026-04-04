import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema/catalog';
import { NotFoundError } from '@/lib/errors/api-error';
import { slugify } from '@/lib/utils/slugify';
import type { CreateCategoryInput } from '@/lib/validators/product.validators';

export async function listCategories() {
  return db.select().from(categories).orderBy(categories.sortOrder);
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
