import { describe, it, expect, beforeEach } from 'vitest';
import { GET as listProductsHandler } from '@/app/api/v1/products/route';
import { get } from '../../../helpers/request';
import { truncateAll } from '../../../helpers/db';
import { seedCategory, seedProduct } from '../../../helpers/factories';

describe('GET /api/v1/products', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('returns 200 with empty array when no products', async () => {
    const res = await listProductsHandler(get('/api/v1/products'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  it('returns 200 with paginated products', async () => {
    const cat = await seedCategory();
    await seedProduct(cat.id, { nameEn: 'Product A' });
    await seedProduct(cat.id, { nameEn: 'Product B' });

    const res = await listProductsHandler(get('/api/v1/products'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.meta.total).toBe(2);
    expect(body.meta.page).toBe(1);
    expect(body.meta.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('respects page/limit query params', async () => {
    const cat = await seedCategory();
    for (let i = 0; i < 5; i++) {
      await seedProduct(cat.id, { nameEn: `Product ${i}` });
    }

    const res = await listProductsHandler(
      get('/api/v1/products', { searchParams: { page: '2', limit: '2' } }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.meta.page).toBe(2);
    expect(body.meta.limit).toBe(2);
    expect(body.meta.total).toBe(5);
    expect(body.meta.totalPages).toBe(3);
  });

  it('filters by category slug', async () => {
    const catA = await seedCategory({ nameEn: 'Category A' });
    const catB = await seedCategory({ nameEn: 'Category B' });
    await seedProduct(catA.id, { nameEn: 'In A' });
    await seedProduct(catB.id, { nameEn: 'In B' });

    const res = await listProductsHandler(
      get('/api/v1/products', { searchParams: { category: catA.slug } }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].nameEn).toBe('In A');
  });

  it('filters by featured=true', async () => {
    const cat = await seedCategory();
    await seedProduct(cat.id, { nameEn: 'Featured', isFeatured: true });
    await seedProduct(cat.id, { nameEn: 'Regular', isFeatured: false });

    const res = await listProductsHandler(
      get('/api/v1/products', { searchParams: { featured: 'true' } }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].nameEn).toBe('Featured');
    expect(body.data[0].isFeatured).toBe(true);
  });
});
