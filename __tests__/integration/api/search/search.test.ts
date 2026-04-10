import { describe, it, expect, beforeEach } from 'vitest';
import { GET as searchHandler } from '@/app/api/v1/search/route';
import { get } from '../../../helpers/request';
import { truncateAll } from '../../../helpers/db';
import { seedCategory, seedProduct } from '../../../helpers/factories';

describe('GET /api/v1/search', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('returns published products matching the query', async () => {
    const cat = await seedCategory();
    await seedProduct(cat.id, { nameEn: 'SearchableKurta' });

    const res = await searchHandler(
      get('/api/v1/search', { searchParams: { q: 'SearchableKurta' } }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].nameEn).toBe('SearchableKurta');
  });

  it('does NOT return draft products matching the query', async () => {
    const cat = await seedCategory();
    await seedProduct(cat.id, { nameEn: 'PublishedOnlyName' });
    await seedProduct(cat.id, { nameEn: 'DraftOnlyName', isPublished: false });

    const res = await searchHandler(
      get('/api/v1/search', { searchParams: { q: 'OnlyName' } }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].nameEn).toBe('PublishedOnlyName');
  });

  it('does NOT return published-but-inactive products', async () => {
    const cat = await seedCategory();
    await seedProduct(cat.id, { nameEn: 'VisibleProduct' });
    await seedProduct(cat.id, { nameEn: 'HiddenProduct', isActive: false });

    const res = await searchHandler(
      get('/api/v1/search', { searchParams: { q: 'Product' } }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].nameEn).toBe('VisibleProduct');
  });
});
