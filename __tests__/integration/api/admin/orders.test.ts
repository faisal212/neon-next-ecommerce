import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/auth');

import { PATCH } from '@/app/api/v1/admin/orders/[id]/status/route';
import * as authModule from '@/lib/auth';
import { AuthenticationError, ForbiddenError } from '@/lib/errors/api-error';
import { patch, routeParams } from '../../../helpers/request';
import { truncateAll } from '../../../helpers/db';
import { seedUser, seedAdmin, seedAddress, seedOrder } from '../../../helpers/factories';

const mockRequireAdmin = vi.mocked(authModule.requireAdmin);

describe('PATCH /api/v1/admin/orders/[id]/status', () => {
  beforeEach(async () => {
    await truncateAll();
    vi.resetAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockRequireAdmin.mockRejectedValue(new AuthenticationError());

    const res = await PATCH(
      patch('/api/v1/admin/orders/xxx/status', { status: 'confirmed' }),
      routeParams({ id: 'xxx' }),
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('returns 403 when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new ForbiddenError('Admin access required'));

    const res = await PATCH(
      patch('/api/v1/admin/orders/xxx/status', { status: 'confirmed' }),
      routeParams({ id: 'xxx' }),
    );
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('returns 400 for invalid status', async () => {
    const admin = await seedAdmin();
    mockRequireAdmin.mockResolvedValue({
      id: admin.id,
      authUserId: admin.authUserId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });

    const user = await seedUser();
    const address = await seedAddress(user.id);
    const order = await seedOrder(user.id, address.id);

    const res = await PATCH(
      patch(`/api/v1/admin/orders/${order.id}/status`, { status: 'nonexistent_status' }),
      routeParams({ id: order.id }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 200 for valid status transition (pending -> confirmed)', async () => {
    const admin = await seedAdmin();
    mockRequireAdmin.mockResolvedValue({
      id: admin.id,
      authUserId: admin.authUserId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });

    const user = await seedUser();
    const address = await seedAddress(user.id);
    const order = await seedOrder(user.id, address.id, { status: 'pending' });

    const res = await PATCH(
      patch(`/api/v1/admin/orders/${order.id}/status`, {
        status: 'confirmed',
        notes: 'Order verified and confirmed',
      }),
      routeParams({ id: order.id }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });
});
