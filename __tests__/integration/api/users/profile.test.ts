import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/auth');

import { GET, PATCH } from '@/app/api/v1/users/[id]/route';
import * as authModule from '@/lib/auth';
import { AuthenticationError, ForbiddenError } from '@/lib/errors/api-error';
import { get, patch, routeParams } from '../../../helpers/request';
import { truncateAll } from '../../../helpers/db';
import { seedUser } from '../../../helpers/factories';

const mockRequireAuth = vi.mocked(authModule.requireAuth);

describe('GET /api/v1/users/[id]', () => {
  beforeEach(async () => {
    await truncateAll();
    vi.resetAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(new AuthenticationError());

    const res = await GET(get('/api/v1/users/xxx'), routeParams({ id: 'xxx' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('returns 403 when accessing another user\'s profile', async () => {
    const user = await seedUser();
    mockRequireAuth.mockResolvedValue({
      id: user.id,
      authUserId: user.authUserId,
      name: user.name,
      email: user.email,
      phonePk: user.phonePk,
      isPhoneVerified: user.isPhoneVerified,
      isActive: user.isActive,
    });

    const otherId = crypto.randomUUID();
    const res = await GET(get(`/api/v1/users/${otherId}`), routeParams({ id: otherId }));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toBe('Cannot view other users');
  });

  it('returns 200 with user data for own profile', async () => {
    const user = await seedUser({ name: 'Ali Khan' });
    mockRequireAuth.mockResolvedValue({
      id: user.id,
      authUserId: user.authUserId,
      name: user.name,
      email: user.email,
      phonePk: user.phonePk,
      isPhoneVerified: user.isPhoneVerified,
      isActive: user.isActive,
    });

    const res = await GET(get(`/api/v1/users/${user.id}`), routeParams({ id: user.id }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(user.id);
    expect(body.data.name).toBe('Ali Khan');
  });
});

describe('PATCH /api/v1/users/[id]', () => {
  beforeEach(async () => {
    await truncateAll();
    vi.resetAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(new AuthenticationError());

    const res = await PATCH(
      patch('/api/v1/users/xxx', { name: 'New Name' }),
      routeParams({ id: 'xxx' }),
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('returns 400 for invalid body', async () => {
    const user = await seedUser();
    mockRequireAuth.mockResolvedValue({
      id: user.id,
      authUserId: user.authUserId,
      name: user.name,
      email: user.email,
      phonePk: user.phonePk,
      isPhoneVerified: user.isPhoneVerified,
      isActive: user.isActive,
    });

    const res = await PATCH(
      patch(`/api/v1/users/${user.id}`, { phonePk: 'not-a-phone' }),
      routeParams({ id: user.id }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 200 with updated data', async () => {
    const user = await seedUser();
    mockRequireAuth.mockResolvedValue({
      id: user.id,
      authUserId: user.authUserId,
      name: user.name,
      email: user.email,
      phonePk: user.phonePk,
      isPhoneVerified: user.isPhoneVerified,
      isActive: user.isActive,
    });

    const res = await PATCH(
      patch(`/api/v1/users/${user.id}`, { name: 'Updated Name', phonePk: '0312-9876543' }),
      routeParams({ id: user.id }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Updated Name');
    expect(body.data.phonePk).toBe('0312-9876543');
  });
});
