import { eq, ne, and, ilike, gte, lte, sql, desc, inArray } from 'drizzle-orm';
import { db, dbPool } from '@/lib/db';
import { products, productTags, productVariants, productImages, inventory, reviews } from '@/lib/db/schema/catalog';
import { categories } from '@/lib/db/schema/catalog';
import { orderItems } from '@/lib/db/schema/orders';
import { cartItems } from '@/lib/db/schema/cart';
import { cartEvents, productViews, dailyProductStats, siteSearches } from '@/lib/db/schema/analytics';
import { wishlistItems, flashSaleProducts, recentlyViewed } from '@/lib/db/schema/marketing';
import { productSeo } from '@/lib/db/schema/seo';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors/api-error';
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
      categoryId: categories.id,
      categoryNameEn: categories.nameEn,
      categorySlug: categories.slug,
      variantId: productVariants.id,
      color: productVariants.color,
      size: productVariants.size,
      sku: productVariants.sku,
      extraPricePkr: productVariants.extraPricePkr,
    })
    .from(products)
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(where)
    .orderBy(desc(products.createdAt), productVariants.color)
    .limit(pagination.limit)
    .offset(pagination.offset);

  const productIds = Array.from(new Set(rows.map((r) => r.productId)));
  const allImages = productIds.length
    ? await db
        .select({
          productId: productImages.productId,
          variantId: productImages.variantId,
          url: productImages.url,
          altText: productImages.altText,
          isPrimary: productImages.isPrimary,
          sortOrder: productImages.sortOrder,
        })
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(productImages.sortOrder)
    : [];

  const enriched = rows.map((row) => {
    const productImgs = allImages.filter((img) => img.productId === row.productId);
    const image =
      productImgs.find((img) => img.variantId === row.variantId)
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
      category: row.categoryId
        ? { id: row.categoryId, nameEn: row.categoryNameEn!, slug: row.categorySlug! }
        : undefined,
      image: image
        ? { url: image.url, altText: image.altText }
        : null,
    };
  });

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

async function generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base);
  let suffix = 1;

  while (true) {
    const candidate = suffix === 1 ? slug : `${slug}-${suffix}`;
    const conditions = [eq(products.slug, candidate)];
    if (excludeId) conditions.push(ne(products.id, excludeId));
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(...conditions))
      .limit(1);

    if (!existing) return candidate;
    suffix++;
  }
}

/**
 * Throws ValidationError if `slug` is already taken by another product.
 * Used when the admin provides an explicit slug on create or update.
 */
async function assertSlugAvailable(slug: string, excludeId?: string): Promise<void> {
  const conditions = [eq(products.slug, slug)];
  if (excludeId) conditions.push(ne(products.id, excludeId));
  const [taken] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(...conditions))
    .limit(1);
  if (taken) {
    throw new ValidationError(`Slug "${slug}" is already in use by another product`);
  }
}

export async function createProduct(input: CreateProductInput) {
  let slug: string;
  if (input.slug) {
    await assertSlugAvailable(input.slug);
    slug = input.slug;
  } else {
    slug = await generateUniqueSlug(input.nameEn);
  }

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

/**
 * Permanently delete a product and every dependent row.
 *
 * Refuses if any `order_items` reference one of the product's variants —
 * order history must never be corrupted by a hard delete. In that case,
 * the admin should deactivate the product (`isActive = false`) instead.
 *
 * Runs inside a single transaction on the pool driver (the http driver
 * does not support transactions). Returns the deleted product's slug so
 * the caller can flush cache tags after the row is gone.
 */
export async function deleteProduct(id: string): Promise<{ slug: string }> {
  return dbPool.transaction(async (tx) => {
    const [product] = await tx
      .select({ id: products.id, slug: products.slug })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!product) throw new NotFoundError('Product not found');

    const variants = await tx
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.productId, id));
    const variantIds = variants.map((v) => v.id);

    // Guardrail: refuse if order history references this product.
    if (variantIds.length > 0) {
      const [orderRef] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(orderItems)
        .where(inArray(orderItems.variantId, variantIds));
      if ((orderRef?.count ?? 0) > 0) {
        throw new ConflictError(
          'Cannot permanently delete: product has order history. Deactivate it instead.',
        );
      }
    }

    // Variant-scoped children — must go before productVariants.
    if (variantIds.length > 0) {
      await tx.delete(inventory).where(inArray(inventory.variantId, variantIds));
      await tx.delete(cartItems).where(inArray(cartItems.variantId, variantIds));
      await tx.delete(cartEvents).where(inArray(cartEvents.variantId, variantIds));
      await tx.delete(wishlistItems).where(inArray(wishlistItems.variantId, variantIds));
    }

    // Product-scoped children. productImages and productViews carry both
    // a productId (NOT NULL) and an optional variantId, so deleting by
    // productId is sufficient and avoids needing the variantIds list.
    await tx.delete(productImages).where(eq(productImages.productId, id));
    await tx.delete(productViews).where(eq(productViews.productId, id));
    await tx.delete(productTags).where(eq(productTags.productId, id));
    await tx.delete(reviews).where(eq(reviews.productId, id));
    await tx.delete(productSeo).where(eq(productSeo.productId, id));
    await tx.delete(dailyProductStats).where(eq(dailyProductStats.productId, id));
    await tx.delete(flashSaleProducts).where(eq(flashSaleProducts.productId, id));
    await tx.delete(recentlyViewed).where(eq(recentlyViewed.productId, id));

    // siteSearches.clicked_product_id is nullable — preserve search
    // analytics by detaching the reference instead of deleting rows.
    await tx
      .update(siteSearches)
      .set({ clickedProductId: null })
      .where(eq(siteSearches.clickedProductId, id));

    // Now safe to drop variants and the product itself.
    await tx.delete(productVariants).where(eq(productVariants.productId, id));
    await tx.delete(products).where(eq(products.id, id));

    return { slug: product.slug };
  });
}

export async function updateProduct(id: string, input: Partial<CreateProductInput>) {
  const updates: Record<string, unknown> = { ...input };
  delete updates.tags;

  // Slug is a user-managed field. Only touch it when the admin explicitly
  // sent a new slug AND it differs from the current value. Renaming the
  // product (changing nameEn) does NOT change the slug — admins must
  // edit it from the slug input directly.
  if (input.slug !== undefined) {
    const [current] = await db
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!current) throw new NotFoundError('Product not found');
    if (input.slug !== current.slug) {
      await assertSlugAvailable(input.slug, id);
      updates.slug = input.slug;
    } else {
      delete updates.slug;
    }
  } else {
    delete updates.slug;
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
