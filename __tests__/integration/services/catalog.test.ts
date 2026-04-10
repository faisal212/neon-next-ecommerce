import { describe, it, expect, beforeEach } from 'vitest';
import { truncateAll } from '../../helpers/db';
import { seedCategory, seedProduct, seedVariantWithStock, seedUser } from '../../helpers/factories';
import {
  getCategoryTree,
  getCategoryBySlug,
  createCategory,
  listCategoriesWithProductCount,
  listEcosystemCategories,
} from '@/lib/services/category.service';
import {
  getProductBySlug,
  getProductById,
  listProducts,
  listProductVariants,
  createProduct,
  updateProduct,
} from '@/lib/services/product.service';
import { createVariant, listVariants } from '@/lib/services/variant.service';
import { NotFoundError } from '@/lib/errors/api-error';

describe('Category Service (integration)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('builds category tree with nested children', async () => {
    const parent = await seedCategory({ nameEn: 'Menswear' });
    await seedCategory({ nameEn: 'Kurtas', parentId: parent.id });
    await seedCategory({ nameEn: 'Shalwar Kameez', parentId: parent.id });

    const tree = await getCategoryTree();
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(2);
  });

  it('gets category by slug', async () => {
    const cat = await seedCategory({ nameEn: 'Test Category' });
    const found = await getCategoryBySlug(cat.slug);
    expect(found.id).toBe(cat.id);
  });

  it('throws NotFoundError for unknown slug', async () => {
    await expect(getCategoryBySlug('nonexistent-slug')).rejects.toThrow('not found');
  });

  it('auto-generates unique slugs', async () => {
    const cat1 = await createCategory({ nameEn: 'Summer Collection' });
    const cat2 = await createCategory({ nameEn: 'Summer Collection' });
    expect(cat1.slug).not.toBe(cat2.slug);
  });
});

describe('Product Service (integration)', () => {
  let categoryId: string;
  let categorySlug: string;

  beforeEach(async () => {
    await truncateAll();
    const cat = await seedCategory();
    categorySlug = cat.slug;
    categoryId = cat.id;
  });

  it('creates product with auto-slug and tags', async () => {
    const product = await createProduct({
      categoryId,
      nameEn: 'Premium Cotton Kurta',
      basePricePkr: '2500.00',
      tags: ['summer', 'cotton'],
    });
    expect(product.slug).toBe('premium-cotton-kurta');
  });

  it('generates unique slugs for duplicate names', async () => {
    const p1 = await createProduct({ categoryId, nameEn: 'Test Product', basePricePkr: '1000.00' });
    const p2 = await createProduct({ categoryId, nameEn: 'Test Product', basePricePkr: '1000.00' });
    expect(p1.slug).toBe('test-product');
    expect(p2.slug).toBe('test-product-2');
  });

  it('gets product by slug with variants and images', async () => {
    const product = await seedProduct(categoryId);
    await seedVariantWithStock(product.id, 10);

    const detail = await getProductBySlug(product.slug);
    expect(detail.id).toBe(product.id);
    expect(detail.variants).toHaveLength(1);
    expect(detail.variants[0].stock).not.toBeNull();
    expect(detail.variants[0].stock!.available).toBe(10);
  });

  it('lists products with category filter', async () => {
    const cat2 = await seedCategory({ nameEn: 'Other' });
    await seedProduct(categoryId);
    await seedProduct(categoryId);
    await seedProduct(cat2.id);

    const { data, total } = await listProducts(
      { categorySlug: (await getCategoryBySlug((await seedCategory()).slug)).slug },
      { page: 1, limit: 20, offset: 0 },
    );
    // New category has no products
    expect(data).toHaveLength(0);
  });

  it('lists products with price range filter', async () => {
    await seedProduct(categoryId, { basePricePkr: '500.00' });
    await seedProduct(categoryId, { basePricePkr: '1500.00' });
    await seedProduct(categoryId, { basePricePkr: '3000.00' });

    const { data } = await listProducts(
      { minPrice: '1000.00', maxPrice: '2000.00' },
      { page: 1, limit: 20, offset: 0 },
    );
    expect(data).toHaveLength(1);
    expect(parseFloat(data[0].basePricePkr)).toBe(1500);
  });

  it('lists featured products only', async () => {
    await seedProduct(categoryId, { isFeatured: true });
    await seedProduct(categoryId, { isFeatured: false });

    const { data } = await listProducts({ featured: true }, { page: 1, limit: 20, offset: 0 });
    expect(data).toHaveLength(1);
    expect(data[0].isFeatured).toBe(true);
  });

  describe('draft workflow', () => {
    it('createProduct defaults new products to draft', async () => {
      const p = await createProduct({
        categoryId,
        nameEn: 'Default Draft',
        basePricePkr: '100.00',
      });
      expect(p.isPublished).toBe(false);
    });

    it('createProduct({ isPublished: true }) creates a published product', async () => {
      const p = await createProduct({
        categoryId,
        nameEn: 'Born Published',
        basePricePkr: '100.00',
        isPublished: true,
      });
      expect(p.isPublished).toBe(true);
    });

    it('updateProduct can flip a draft to published', async () => {
      const p = await createProduct({
        categoryId,
        nameEn: 'Draft To Publish',
        basePricePkr: '100.00',
      });
      expect(p.isPublished).toBe(false);
      const updated = await updateProduct(p.id, { isPublished: true });
      expect(updated.isPublished).toBe(true);
    });

    it('updateProduct can unpublish a published product', async () => {
      const p = await createProduct({
        categoryId,
        nameEn: 'Publish To Draft',
        basePricePkr: '100.00',
        isPublished: true,
      });
      const updated = await updateProduct(p.id, { isPublished: false });
      expect(updated.isPublished).toBe(false);
    });

    it('listProducts excludes drafts by default', async () => {
      await seedProduct(categoryId, { nameEn: 'Pub A' });
      await seedProduct(categoryId, { nameEn: 'Pub B' });
      await seedProduct(categoryId, { nameEn: 'Drafty', isPublished: false });

      const { data, total } = await listProducts({}, { page: 1, limit: 20, offset: 0 });
      expect(data).toHaveLength(2);
      expect(total).toBe(2);
      expect(data.every((p) => p.isPublished)).toBe(true);
    });

    it('listProducts({ includeDrafts: true }) returns drafts', async () => {
      await seedProduct(categoryId, { nameEn: 'Pub A' });
      await seedProduct(categoryId, { nameEn: 'Pub B' });
      await seedProduct(categoryId, { nameEn: 'Drafty', isPublished: false });

      const { data, total } = await listProducts(
        { includeDrafts: true },
        { page: 1, limit: 20, offset: 0 },
      );
      expect(data).toHaveLength(3);
      expect(total).toBe(3);
    });

    it('listProducts also requires isActive in addition to isPublished', async () => {
      await seedProduct(categoryId, { nameEn: 'Visible' });
      await seedProduct(categoryId, { nameEn: 'Hidden', isActive: false });
      await seedProduct(categoryId, { nameEn: 'Drafty', isPublished: false });

      const { data } = await listProducts({}, { page: 1, limit: 20, offset: 0 });
      expect(data).toHaveLength(1);
      expect(data[0].nameEn).toBe('Visible');
    });

    it('listProductVariants excludes drafts by default', async () => {
      const pubProd = await seedProduct(categoryId, { nameEn: 'Pub' });
      await seedVariantWithStock(pubProd.id, 5);
      const draftProd = await seedProduct(categoryId, { nameEn: 'Draft', isPublished: false });
      await seedVariantWithStock(draftProd.id, 5);

      const { data, total } = await listProductVariants({}, { page: 1, limit: 20, offset: 0 });
      expect(data).toHaveLength(1);
      expect(total).toBe(1);
      expect(data[0].nameEn).toBe('Pub');
    });

    it('listProductVariants({ includeDrafts: true }) returns draft variants', async () => {
      const pubProd = await seedProduct(categoryId, { nameEn: 'Pub' });
      await seedVariantWithStock(pubProd.id, 5);
      const draftProd = await seedProduct(categoryId, { nameEn: 'Draft', isPublished: false });
      await seedVariantWithStock(draftProd.id, 5);

      const { data, total } = await listProductVariants(
        { includeDrafts: true },
        { page: 1, limit: 20, offset: 0 },
      );
      expect(data).toHaveLength(2);
      expect(total).toBe(2);
    });

    it('getProductBySlug throws NotFoundError for a draft', async () => {
      const draft = await seedProduct(categoryId, { isPublished: false });
      await expect(getProductBySlug(draft.slug)).rejects.toThrow(NotFoundError);
    });

    it('getProductBySlug succeeds for a published product', async () => {
      const pub = await seedProduct(categoryId, { nameEn: 'Published' });
      const result = await getProductBySlug(pub.slug);
      expect(result.id).toBe(pub.id);
    });

    it('getProductById returns drafts (admin access)', async () => {
      const draft = await seedProduct(categoryId, { isPublished: false });
      const result = await getProductById(draft.id);
      expect(result.id).toBe(draft.id);
      expect(result.isPublished).toBe(false);
    });

    it('listProducts with featured: true still filters drafts', async () => {
      await seedProduct(categoryId, { nameEn: 'Pub Feat', isFeatured: true });
      await seedProduct(categoryId, { nameEn: 'Draft Feat', isFeatured: true, isPublished: false });

      const { data } = await listProducts({ featured: true }, { page: 1, limit: 20, offset: 0 });
      expect(data).toHaveLength(1);
      expect(data[0].nameEn).toBe('Pub Feat');
    });

    it('listProducts category filter still excludes drafts', async () => {
      await seedProduct(categoryId, { nameEn: 'Pub in Cat' });
      await seedProduct(categoryId, { nameEn: 'Draft in Cat', isPublished: false });

      const { data } = await listProducts(
        { categorySlug },
        { page: 1, limit: 20, offset: 0 },
      );
      expect(data).toHaveLength(1);
      expect(data[0].nameEn).toBe('Pub in Cat');
    });

    it('listProducts price range filter still excludes drafts', async () => {
      await seedProduct(categoryId, { nameEn: 'Pub 1500', basePricePkr: '1500.00' });
      await seedProduct(categoryId, {
        nameEn: 'Draft 1500',
        basePricePkr: '1500.00',
        isPublished: false,
      });

      const { data } = await listProducts(
        { minPrice: '1000.00', maxPrice: '2000.00' },
        { page: 1, limit: 20, offset: 0 },
      );
      expect(data).toHaveLength(1);
      expect(data[0].nameEn).toBe('Pub 1500');
    });
  });
});

describe('Category product counts with drafts (integration)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('listCategoriesWithProductCount does not count drafts', async () => {
    const cat = await seedCategory({ nameEn: 'Counted' });
    await seedProduct(cat.id, { nameEn: 'Pub A' });
    await seedProduct(cat.id, { nameEn: 'Pub B' });
    await seedProduct(cat.id, { nameEn: 'Draft', isPublished: false });

    const rows = await listCategoriesWithProductCount();
    const row = rows.find((r) => r.id === cat.id);
    expect(row).toBeDefined();
    expect(row!.productCount).toBe(2);
  });

  it('listEcosystemCategories does not count drafts', async () => {
    const cat = await seedCategory({ nameEn: 'Eco', isEcosystemFeatured: true });
    await seedProduct(cat.id, { nameEn: 'Pub' });
    await seedProduct(cat.id, { nameEn: 'Draft', isPublished: false });

    const rows = await listEcosystemCategories();
    const row = rows.find((r) => r.id === cat.id);
    expect(row).toBeDefined();
    expect(row!.productCount).toBe(1);
  });
});

describe('Variant Service (integration)', () => {
  let productId: string;

  beforeEach(async () => {
    await truncateAll();
    const cat = await seedCategory();
    const product = await seedProduct(cat.id);
    productId = product.id;
  });

  it('creates variant with auto inventory record', async () => {
    const variant = await createVariant(productId, { sku: 'TEST-BLU-M' });
    expect(variant.sku).toBe('TEST-BLU-M');

    // Inventory should be auto-created
    const { getInventory } = await import('@/lib/services/inventory.service');
    const inv = await getInventory(variant.id);
    expect(inv.quantityOnHand).toBe(0);
  });

  it('rejects duplicate SKU', async () => {
    await createVariant(productId, { sku: 'UNIQUE-SKU' });
    await expect(createVariant(productId, { sku: 'UNIQUE-SKU' })).rejects.toThrow('already exists');
  });

  it('lists variants for a product', async () => {
    await createVariant(productId, { sku: 'V1' });
    await createVariant(productId, { sku: 'V2' });
    const variants = await listVariants(productId);
    expect(variants).toHaveLength(2);
  });
});
