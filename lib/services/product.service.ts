import { eq, and, ilike, gte, lte, sql, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, productTags, productVariants, productImages, inventory } from '@/lib/db/schema/catalog';
import { categories } from '@/lib/db/schema/catalog';
import { NotFoundError } from '@/lib/errors/api-error';
import { slugify } from '@/lib/utils/slugify';
import type { CreateProductInput } from '@/lib/validators/product.validators';
import type { PaginationParams } from '@/lib/utils/pagination';

export async function listProducts(
  filters: {
    categorySlug?: string;
    minPrice?: string;
    maxPrice?: string;
    q?: string;
    featured?: boolean;
  },
  pagination: PaginationParams,
) {
  const conditions = [eq(products.isActive, true)];

  if (filters.categorySlug) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, filters.categorySlug))
      .limit(1);
    if (cat) {
      conditions.push(eq(products.categoryId, cat.id));
    }
  }

  if (filters.minPrice) {
    conditions.push(gte(products.basePricePkr, filters.minPrice));
  }

  if (filters.maxPrice) {
    conditions.push(lte(products.basePricePkr, filters.maxPrice));
  }

  if (filters.q) {
    conditions.push(ilike(products.nameEn, `%${filters.q}%`));
  }

  if (filters.featured) {
    conditions.push(eq(products.isFeatured, true));
  }

  const where = and(...conditions);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(where);

  const data = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(desc(products.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return {
    data,
    total: countResult?.count ?? 0,
  };
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) throw new NotFoundError('Product not found');

  // Fetch related data in parallel
  const [variants, images, tags] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
    db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(productImages.sortOrder),
    db.select().from(productTags).where(eq(productTags.productId, product.id)),
  ]);

  // Fetch inventory for each variant
  const variantsWithStock = await Promise.all(
    variants.map(async (v) => {
      const [inv] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.variantId, v.id))
        .limit(1);
      return {
        ...v,
        stock: inv
          ? { onHand: inv.quantityOnHand, reserved: inv.quantityReserved, available: inv.quantityOnHand - inv.quantityReserved }
          : null,
      };
    }),
  );

  return {
    ...product,
    variants: variantsWithStock,
    images,
    tags: tags.map((t) => t.tag),
  };
}

export async function getProductById(id: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) throw new NotFoundError('Product not found');
  return product;
}

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let suffix = 1;

  while (true) {
    const candidate = suffix === 1 ? slug : `${slug}-${suffix}`;
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, candidate))
      .limit(1);

    if (!existing) return candidate;
    suffix++;
  }
}

export async function createProduct(input: CreateProductInput) {
  const slug = await generateUniqueSlug(input.nameEn);

  const [product] = await db
    .insert(products)
    .values({
      categoryId: input.categoryId,
      nameEn: input.nameEn,
      nameUr: input.nameUr ?? null,
      slug,
      descriptionEn: input.descriptionEn ?? null,
      descriptionUr: input.descriptionUr ?? null,
      basePricePkr: input.basePricePkr,
      isActive: input.isActive ?? true,
      isFeatured: input.isFeatured ?? false,
    })
    .returning();

  // Insert tags if provided
  if (input.tags?.length) {
    await db.insert(productTags).values(
      input.tags.map((tag) => ({ productId: product.id, tag })),
    );
  }

  return product;
}

export async function updateProduct(id: string, input: Partial<CreateProductInput>) {
  const updates: Record<string, unknown> = { ...input };
  delete updates.tags;

  if (input.nameEn) {
    updates.slug = await generateUniqueSlug(input.nameEn);
  }

  updates.updatedAt = new Date();

  const [product] = await db
    .update(products)
    .set(updates)
    .where(eq(products.id, id))
    .returning();

  if (!product) throw new NotFoundError('Product not found');

  // Replace tags if provided
  if (input.tags) {
    await db.delete(productTags).where(eq(productTags.productId, id));
    if (input.tags.length) {
      await db.insert(productTags).values(
        input.tags.map((tag) => ({ productId: id, tag })),
      );
    }
  }

  return product;
}
