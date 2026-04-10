import { describe, it, expect } from 'vitest';
import {
  createCategorySchema,
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateInventorySchema,
  createReviewSchema,
  presignSchema,
} from '@/lib/validators/product.validators';

describe('createCategorySchema', () => {
  it('accepts valid category', () => {
    expect(createCategorySchema.safeParse({ nameEn: 'Clothing' }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(createCategorySchema.safeParse({ nameEn: '' }).success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = createCategorySchema.safeParse({
      nameEn: 'Kurtas',
      nameUr: 'کرتے',
      parentId: '550e8400-e29b-41d4-a716-446655440000',
      sortOrder: 5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid parentId UUID', () => {
    expect(createCategorySchema.safeParse({ nameEn: 'Test', parentId: 'bad' }).success).toBe(false);
  });
});

describe('createProductSchema', () => {
  const valid = {
    categoryId: '550e8400-e29b-41d4-a716-446655440000',
    nameEn: 'Premium Cotton Kurta',
    basePricePkr: '2500.00',
  };

  it('accepts valid product', () => {
    expect(createProductSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing categoryId', () => {
    const { categoryId, ...rest } = valid;
    expect(createProductSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects invalid price format', () => {
    expect(createProductSchema.safeParse({ ...valid, basePricePkr: 'abc' }).success).toBe(false);
    expect(createProductSchema.safeParse({ ...valid, basePricePkr: '-100' }).success).toBe(false);
  });

  it('accepts price with 2 decimal places', () => {
    expect(createProductSchema.safeParse({ ...valid, basePricePkr: '1999.99' }).success).toBe(true);
  });

  it('rejects price with 3 decimal places', () => {
    expect(createProductSchema.safeParse({ ...valid, basePricePkr: '99.999' }).success).toBe(false);
  });

  it('accepts tags array', () => {
    const result = createProductSchema.safeParse({ ...valid, tags: ['summer', 'cotton', 'new'] });
    expect(result.success).toBe(true);
  });

  it('accepts isPublished: true', () => {
    expect(createProductSchema.safeParse({ ...valid, isPublished: true }).success).toBe(true);
  });

  it('accepts isPublished: false', () => {
    expect(createProductSchema.safeParse({ ...valid, isPublished: false }).success).toBe(true);
  });

  it('accepts omitted isPublished (optional)', () => {
    // `valid` has no isPublished — create should still succeed.
    expect(createProductSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects non-boolean isPublished', () => {
    expect(
      createProductSchema.safeParse({ ...valid, isPublished: 'yes' as unknown as boolean }).success,
    ).toBe(false);
  });
});

describe('updateProductSchema', () => {
  it('accepts { isPublished: true } alone (partial)', () => {
    expect(updateProductSchema.safeParse({ isPublished: true }).success).toBe(true);
  });
});

describe('createVariantSchema', () => {
  it('accepts valid variant', () => {
    expect(createVariantSchema.safeParse({ sku: 'KRT-BLU-M' }).success).toBe(true);
  });

  it('rejects empty SKU', () => {
    expect(createVariantSchema.safeParse({ sku: '' }).success).toBe(false);
  });

  it('accepts optional color and size', () => {
    const result = createVariantSchema.safeParse({
      sku: 'KRT-BLU-M',
      color: 'Blue',
      size: 'M',
      extraPricePkr: '200.00',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateInventorySchema', () => {
  it('accepts valid inventory update', () => {
    expect(updateInventorySchema.safeParse({ quantityOnHand: 100 }).success).toBe(true);
  });

  it('rejects negative quantity', () => {
    expect(updateInventorySchema.safeParse({ quantityOnHand: -5 }).success).toBe(false);
  });

  it('accepts optional lowStockThreshold', () => {
    expect(updateInventorySchema.safeParse({ quantityOnHand: 50, lowStockThreshold: 10 }).success).toBe(true);
  });
});

describe('createReviewSchema', () => {
  const valid = {
    orderItemId: '550e8400-e29b-41d4-a716-446655440000',
    rating: 4,
  };

  it('accepts valid review', () => {
    expect(createReviewSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects rating below 1', () => {
    expect(createReviewSchema.safeParse({ ...valid, rating: 0 }).success).toBe(false);
  });

  it('rejects rating above 5', () => {
    expect(createReviewSchema.safeParse({ ...valid, rating: 6 }).success).toBe(false);
  });

  it('rejects non-integer rating', () => {
    expect(createReviewSchema.safeParse({ ...valid, rating: 3.5 }).success).toBe(false);
  });

  it('accepts optional comment', () => {
    expect(createReviewSchema.safeParse({ ...valid, comment: 'Great quality!' }).success).toBe(true);
  });
});

describe('presignSchema', () => {
  it('accepts valid presign request', () => {
    const result = presignSchema.safeParse({
      filename: 'photo.jpg',
      contentType: 'image/jpeg',
      context: 'products/abc123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid content type', () => {
    const result = presignSchema.safeParse({
      filename: 'doc.pdf',
      contentType: 'application/pdf',
      context: 'products/abc',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all allowed image types', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/avif']) {
      const result = presignSchema.safeParse({
        filename: 'photo.jpg',
        contentType: type,
        context: 'products/abc',
      });
      expect(result.success).toBe(true);
    }
  });
});
