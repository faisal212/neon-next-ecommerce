import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/auth');

import { GET, POST } from '@/app/api/v1/admin/products/route';
import { PATCH as adminProductPatch, GET as adminProductGet } from '@/app/api/v1/admin/products/[id]/route';
import * as authModule from '@/lib/auth';
import { AuthenticationError, ForbiddenError } from '@/lib/errors/api-error';
import { get, post, patch, routeParams } from '../../../helpers/request';
import { truncateAll } from '../../../helpers/db';
import { seedCategory, seedProduct, seedAdmin } from '../../../helpers/factories';

const mockRequireAdmin = vi.mocked(authModule.requireAdmin);

describe('GET /api/v1/admin/products', () => {
  beforeEach(async () => {
    await truncateAll();
    vi.resetAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockRequireAdmin.mockRejectedValue(new AuthenticationError());

    const res = await GET(get('/api/v1/admin/products'));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('returns 403 when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new ForbiddenError('Admin access required'));

    const res = await GET(get('/api/v1/admin/products'));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('returns 200 with paginated products for admin', async () => {
    const admin = await seedAdmin();
    mockRequireAdmin.mockResolvedValue({
      id: admin.id,
      authUserId: admin.authUserId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });

    const cat = await seedCategory();
    await seedProduct(cat.id, { nameEn: 'Product A' });
    await seedProduct(cat.id, { nameEn: 'Product B' });

    const res = await GET(get('/api/v1/admin/products'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.meta.total).toBe(2);
    expect(body.meta.page).toBe(1);
  });

  it('includes draft products in the admin list', async () => {
    const admin = await seedAdmin();
    mockRequireAdmin.mockResolvedValue({
      id: admin.id,
      authUserId: admin.authUserId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });

    const cat = await seedCategory();
    await seedProduct(cat.id, { nameEn: 'Published One' });
    await seedProduct(cat.id, { nameEn: 'Draft One', isPublished: false });

    const res = await GET(get('/api/v1/admin/products'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.meta.total).toBe(2);
    const names = body.data.map((p: { nameEn: string }) => p.nameEn).sort();
    expect(names).toEqual(['Draft One', 'Published One']);
  });
});

describe('POST /api/v1/admin/products', () => {
  beforeEach(async () => {
    await truncateAll();
    vi.resetAllMocks();
  });

  it('returns 403 for non-authorized role', async () => {
    mockRequireAdmin.mockRejectedValue(
      new ForbiddenError("Role 'support' is not authorized for this action"),
    );

    const cat = await seedCategory();
    const res = await POST(
      post('/api/v1/admin/products', {
        categoryId: cat.id,
        nameEn: 'New Product',
        basePricePkr: '1500.00',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('returns 400 for invalid body', async () => {
    const admin = await seedAdmin();
    mockRequireAdmin.mockResolvedValue({
      id: admin.id,
      authUserId: admin.authUserId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });

    const res = await POST(
      post('/api/v1/admin/products', {
        // missing required fields: categoryId, nameEn, basePricePkr
        descriptionEn: 'A product without required fields',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 201 for valid product creation', async () => {
    const admin = await seedAdmin();
    mockRequireAdmin.mockResolvedValue({
      id: admin.id,
      authUserId: admin.authUserId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });

    const cat = await seedCategory();
    const res = await POST(
      post('/api/v1/admin/products', {
        categoryId: cat.id,
        nameEn: 'Premium Lawn Suit',
        nameUr: 'پریمیم لان سوٹ',
        descriptionEn: 'A high-quality lawn suit',
        basePricePkr: '4500.00',
        isActive: true,
        isFeatured: true,
        tags: ['lawn', 'summer', 'premium'],
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.nameEn).toBe('Premium Lawn Suit');
    expect(body.data.basePricePkr).toBe('4500.00');
    expect(body.data.categoryId).toBe(cat.id);
  });

  it('creates new products as draft by default', async () => {
    const admin = await seedAdmin();
    mockRequireAdmin.mockResolvedValue({
      id: admin.id,
      authUserId: admin.authUserId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });

    const cat = await seedCategory();
    const res = await POST(
      post('/api/v1/admin/products', {
        categoryId: cat.id,
        nameEn: 'Drafty By Default',
        basePricePkr: '1200.00',
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.isPublished).toBe(false);
  });

  it('can create a published product when isPublished: true is passed', async () => {
    const admin = await seedAdmin();
    mockRequireAdmin.mockResolvedValue({
      id: admin.id,
      authUserId: admin.authUserId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });

    const cat = await seedCategory();
    const res = await POST(
      post('/api/v1/admin/products', {
        categoryId: cat.id,
        nameEn: 'Live On Creation',
        basePricePkr: '1200.00',
        isPublished: true,
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.isPublished).toBe(true);
  });
});

describe('PATCH /api/v1/admin/products/[id]', () => {
  beforeEach(async () => {
    await truncateAll();
    vi.resetAllMocks();
  });

  function mockAdmin(admin: Awaited<ReturnType<typeof seedAdmin>>) {
    mockRequireAdmin.mockResolvedValue({
      id: admin.id,
      authUserId: admin.authUserId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });
  }

  it('publishes a draft product', async () => {
    const admin = await seedAdmin();
    mockAdmin(admin);

    const cat = await seedCategory();
    const draft = await seedProduct(cat.id, { nameEn: 'To Publish', isPublished: false });

    const res = await adminProductPatch(
      patch(`/api/v1/admin/products/${draft.id}`, { isPublished: true }),
      routeParams({ id: draft.id }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.isPublished).toBe(true);

    // Confirm via a follow-up GET through the same admin handler
    const getRes = await adminProductGet(
      get(`/api/v1/admin/products/${draft.id}`),
      routeParams({ id: draft.id }),
    );
    const getBody = await getRes.json();
    expect(getBody.data.isPublished).toBe(true);
  });

  it('unpublishes a published product', async () => {
    const admin = await seedAdmin();
    mockAdmin(admin);

    const cat = await seedCategory();
    const pub = await seedProduct(cat.id, { nameEn: 'To Unpublish' });

    const res = await adminProductPatch(
      patch(`/api/v1/admin/products/${pub.id}`, { isPublished: false }),
      routeParams({ id: pub.id }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.isPublished).toBe(false);
  });
});
