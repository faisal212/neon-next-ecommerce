import { describe, it, expect, beforeEach } from 'vitest';
import { GET as getProductHandler } from '@/app/api/v1/products/[slug]/route';
import { get, routeParams } from '../../../helpers/request';
import { truncateAll } from '../../../helpers/db';
import { seedCategory, seedProduct, seedVariantWithStock } from '../../../helpers/factories';

describe('GET /api/v1/products/[slug]', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('returns 200 with product data for valid slug', async () => {
    const cat = await seedCategory();
    const product = await seedProduct(cat.id, { nameEn: 'Premium Kurta' });
    await seedVariantWithStock(product.id, 15);

    const res = await getProductHandler(
      get(`/api/v1/products/${product.slug}`),
      routeParams({ slug: product.slug }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(product.id);
    expect(body.data.nameEn).toBe('Premium Kurta');
    expect(body.data.slug).toBe(product.slug);
    expect(body.data.variants).toHaveLength(1);
    expect(body.data.variants[0].stock).not.toBeNull();
    expect(body.data.variants[0].stock!.available).toBe(15);
  });

  it('returns 404 for nonexistent slug', async () => {
    const res = await getProductHandler(
      get('/api/v1/products/does-not-exist'),
      routeParams({ slug: 'does-not-exist' }),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });

  it('returns 404 for a draft product', async () => {
    const cat = await seedCategory();
    const draft = await seedProduct(cat.id, { nameEn: 'Draft One', isPublished: false });

    const res = await getProductHandler(
      get(`/api/v1/products/${draft.slug}`),
      routeParams({ slug: draft.slug }),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });

  it('returns 200 for a published product (regression)', async () => {
    const cat = await seedCategory();
    const pub = await seedProduct(cat.id, { nameEn: 'Published One' });
    await seedVariantWithStock(pub.id, 5);

    const res = await getProductHandler(
      get(`/api/v1/products/${pub.slug}`),
      routeParams({ slug: pub.slug }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(pub.id);
  });
});
