import { z } from 'zod';

// Slug is user-managed: lowercase letters, digits, and single hyphens only.
// No leading/trailing/consecutive hyphens. Used by both products and categories.
const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase letters, numbers, and hyphens (no leading/trailing/consecutive hyphens)',
  );

// ── Category ─────────────────────────────────────────────────────
export const createCategorySchema = z.object({
  nameEn: z.string().min(1).max(120),
  nameUr: z.string().max(120).optional(),
  slug: slugSchema.optional(),
  parentId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isEcosystemFeatured: z.boolean().optional(),
  ecosystemOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ── Product ──────────────────────────────────────────────────────
export const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  nameEn: z.string().min(1).max(200),
  nameUr: z.string().max(200).optional(),
  slug: slugSchema.optional(),
  descriptionEn: z.string().optional(),
  descriptionUr: z.string().optional(),
  basePricePkr: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid price'),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  tags: z.array(z.string().max(80)).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  q: z.string().max(200).optional(),
  featured: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// ── Variant ──────────────────────────────────────────────────────
export const createVariantSchema = z.object({
  sku: z.string().min(1).max(80),
  color: z.string().max(60).optional(),
  size: z.string().max(30).optional(),
  extraPricePkr: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  isActive: z.boolean().optional(),
});

export const updateVariantSchema = createVariantSchema.partial();

// ── Inventory ────────────────────────────────────────────────────
export const updateInventorySchema = z.object({
  quantityOnHand: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
});

// ── Review ───────────────────────────────────────────────────────
export const createReviewSchema = z.object({
  orderItemId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// ── Image ────────────────────────────────────────────────────────
export const createImageSchema = z.object({
  url: z.string().url(),
  variantId: z.string().uuid().optional(),
  altText: z.string().max(200).optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ── Upload presign ───────────────────────────────────────────────
export const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  context: z.string().min(1).max(100),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateImageInput = z.infer<typeof createImageSchema>;
