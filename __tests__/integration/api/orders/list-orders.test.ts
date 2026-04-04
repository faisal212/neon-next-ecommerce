import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/auth');

import { GET } from '@/app/api/v1/orders/route';
import * as authModule from '@/lib/auth';
import { get } from '../../../helpers/request';
import { truncateAll } from '../../../helpers/db';
import { seedUser, seedAddress, seedOrder } from '../../../helpers/factories';

const mockGetCurrentUser = vi.mocked(authModule.getCurrentUser);

describe('GET /api/v1/orders', () => {
  let userId: string;
  let addressId: string;

  beforeEach(async () => {
    vi.resetAllMocks();
    await truncateAll();

    const user = await seedUser();
    userId = user.id;

    const address = await seedAddress(userId);
    addressId = address.id;
  });

  it('returns 400 when not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await GET(get('/api/v1/orders'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Authentication required to view orders');
  });

  it('returns 200 with empty orders for authenticated user', async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: userId,
      authUserId: crypto.randomUUID(),
      name: 'Test User',
      email: 'test@example.com',
      phonePk: null,
      isPhoneVerified: false,
      isActive: true,
    });

    const res = await GET(get('/api/v1/orders'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
    expect(body.meta.page).toBe(1);
  });

  it('returns 200 with paginated orders', async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: userId,
      authUserId: crypto.randomUUID(),
      name: 'Test User',
      email: 'test@example.com',
      phonePk: null,
      isPhoneVerified: false,
      isActive: true,
    });

    // Seed 3 orders for the user
    await seedOrder(userId, addressId, { totalPkr: '1500.00' });
    await seedOrder(userId, addressId, { totalPkr: '2500.00' });
    await seedOrder(userId, addressId, { totalPkr: '3500.00' });

    const res = await GET(
      get('/api/v1/orders', { searchParams: { page: '1', limit: '2' } }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.meta.total).toBe(3);
    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(2);
    expect(body.meta.totalPages).toBe(2);
  });
});
