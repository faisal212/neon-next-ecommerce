import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/auth');

import { GET } from '@/app/api/v1/auth/me/route';
import * as authModule from '@/lib/auth';
import { AuthenticationError } from '@/lib/errors/api-error';

const mockRequireAuth = vi.mocked(authModule.requireAuth);

describe('GET /api/v1/auth/me', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(new AuthenticationError());

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('returns 200 with user data when authenticated', async () => {
    const mockUser = {
      id: crypto.randomUUID(),
      authUserId: crypto.randomUUID(),
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phonePk: null,
      isPhoneVerified: false,
      isActive: true,
    };

    mockRequireAuth.mockResolvedValue(mockUser);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      id: mockUser.id,
      authUserId: mockUser.authUserId,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phonePk: null,
      isPhoneVerified: false,
      isActive: true,
    });
  });
});
