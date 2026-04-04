import { describe, it, expect, beforeEach } from 'vitest';
import { truncateAll } from '../../helpers/db';
import { seedCategory, seedProduct, seedVariantWithStock, seedUser } from '../../helpers/factories';
import { getCategoryTree, getCategoryBySlug, createCategory } from '@/lib/services/category.service';
import { getProductBySlug, listProducts, createProduct } from '@/lib/services/product.service';
import { createVariant, listVariants } from '@/lib/services/variant.service';

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

  beforeEach(async () => {
    await truncateAll();
    const cat = await seedCategory();
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
