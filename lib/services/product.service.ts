import { eq, and, ilike, gte, lte, sql, desc, inArray } from 'drizzle-orm';
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
    includeDrafts?: boolean;
  },
  pagination: PaginationParams,
) {
  const conditions = filters.includeDrafts
    ? []
    : [eq(products.isActive, true), eq(products.isPublished, true)];

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

  // Fetch categories and primary images for each product
  const enriched = await Promise.all(
    data.map(async (product) => {
      const [[category], images] = await Promise.all([
        db
          .select({ id: categories.id, nameEn: categories.nameEn, slug: categories.slug })
          .from(categories)
          .where(eq(categories.id, product.categoryId))
          .limit(1),
        db
          .select({ id: productImages.id, url: productImages.url, altText: productImages.altText, isPrimary: productImages.isPrimary })
          .from(productImages)
          .where(eq(productImages.productId, product.id))
          .orderBy(productImages.sortOrder)
          .limit(5),
      ]);
      return { ...product, category: category ?? undefined, images };
    }),
  );

  return {
    data: enriched,
    total: countResult?.count ?? 0,
  };
}

export async function listProductVariants(
  filters: {
    categorySlug?: string;
    minPrice?: string;
    maxPrice?: string;
    q?: string;
    featured?: boolean;
    includeDrafts?: boolean;
  },
  pagination: PaginationParams,
) {
  const conditions = filters.includeDrafts
    ? [eq(productVariants.isActive, true)]
    : [eq(products.isActive, true), eq(products.isPublished, true), eq(productVariants.isActive, true)];

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
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .where(where);

  const rows = await db
    .select({
      productId: products.id,
      nameEn: products.nameEn,
      slug: products.slug,
      basePricePkr: products.basePricePkr,
      categoryId: products.categoryId,
      variantId: productVariants.id,
      color: productVariants.color,
      size: productVariants.size,
      sku: productVariants.sku,
      extraPricePkr: productVariants.extraPricePkr,
    })
    .from(products)
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .where(where)
    .orderBy(desc(products.createdAt), productVariants.color)
    .limit(pagination.limit)
    .offset(pagination.offset);

  const enriched = await Promise.all(
    rows.map(async (row) => {
      // Fetch category, variant-specific image, and product primary image in parallel
      const [[category], variantImages, productImgs] = await Promise.all([
        db.select({ id: categories.id, nameEn: categories.nameEn, slug: categories.slug })
          .from(categories).where(eq(categories.id, row.categoryId)).limit(1),
        db.select({ url: productImages.url, altText: productImages.altText })
          .from(productImages)
          .where(and(eq(productImages.productId, row.productId), eq(productImages.variantId, row.variantId)))
          .orderBy(productImages.sortOrder).limit(1),
        db.select({ url: productImages.url, altText: productImages.altText, isPrimary: productImages.isPrimary })
          .from(productImages)
          .where(and(eq(productImages.productId, row.productId)))
          .orderBy(productImages.sortOrder).limit(1),
      ]);

      const image = variantImages[0]
        ?? productImgs.find((img) => img.isPrimary)
        ?? productImgs[0]
        ?? null;

      const base = parseFloat(row.basePricePkr);
      const extra = parseFloat(row.extraPricePkr ?? '0');
      const totalPrice = (base + extra).toFixed(2);

      const variantParts = [row.color, row.size].filter(Boolean);
      const variantLabel = variantParts.length > 0 ? variantParts.join(' / ') : null;

      return {
        productId: row.productId,
        variantId: row.variantId,
        nameEn: row.nameEn,
        slug: row.slug,
        basePricePkr: row.basePricePkr,
        totalPricePkr: totalPrice,
        variantLabel,
        category: category ?? undefined,
        image,
      };
    }),
  );

  return {
    data: enriched,
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
  if (!product.isPublished) throw new NotFoundError('Product not found');

  // Fetch related data in parallel
  const [variants, images, tags] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
    db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(productImages.sortOrder),
    db.select().from(productTags).where(eq(productTags.productId, product.id)),
  ]);

  // Fetch inventory for all variants in one query
  const variantIds = variants.map((v) => v.id);
  const inventoryRows = variantIds.length > 0
    ? await db.select().from(inventory).where(inArray(inventory.variantId, variantIds))
    : [];
  const inventoryMap = new Map(inventoryRows.map((inv) => [inv.variantId, inv]));

  const variantsWithStock = variants.map((v) => {
    const inv = inventoryMap.get(v.id);
    return {
      ...v,
      stock: inv
        ? { onHand: inv.quantityOnHand, reserved: inv.quantityReserved, available: inv.quantityOnHand - inv.quantityReserved }
        : null,
    };
  });

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
      isPublished: input.isPublished ?? false,
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
