import { describe, it, expect, beforeEach, vi } from 'vitest';
import { neon } from '@neondatabase/serverless';

vi.mock('@/lib/auth');

import { POST } from '@/app/api/v1/auth/register/route';
import * as authModule from '@/lib/auth';
import { AuthenticationError } from '@/lib/errors/api-error';
import { post } from '../../../helpers/request';
import { truncateAll } from '../../../helpers/db';

const sql = neon(process.env.DATABASE_URL!);
const mockRequireAuthUserId = vi.mocked(authModule.requireAuthUserId);

async function createAuthUser(): Promise<string> {
  const id = crypto.randomUUID();
  await sql`INSERT INTO neon_auth."user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
            VALUES (${id}, 'Test', ${`auth-${id.slice(0, 8)}@test.com`}, false, NOW(), NOW())`;
  return id;
}

describe('POST /api/v1/auth/register', () => {
  beforeEach(async () => {
    await truncateAll();
    vi.resetAllMocks();
  });

  it('returns 401 when no session is present', async () => {
    mockRequireAuthUserId.mockRejectedValue(new AuthenticationError());

    const req = post('/api/v1/auth/register', {
      firstName: 'Ali',
      lastName: 'Khan',
      email: 'ali@example.com',
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('returns 400 for invalid body (missing firstName)', async () => {
    const authUserId = await createAuthUser();
    mockRequireAuthUserId.mockResolvedValue(authUserId);

    const req = post('/api/v1/auth/register', {
      lastName: 'Khan',
      email: 'ali@example.com',
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 201 with user data for valid registration (no phone at signup)', async () => {
    const authUserId = await createAuthUser();
    mockRequireAuthUserId.mockResolvedValue(authUserId);

    const req = post('/api/v1/auth/register', {
      firstName: 'Ali',
      lastName: 'Khan',
      email: 'ali@example.com',
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      authUserId,
      firstName: 'Ali',
      lastName: 'Khan',
      email: 'ali@example.com',
      phonePk: null,
      isActive: true,
    });
    expect(body.data.id).toBeDefined();
  });
});
