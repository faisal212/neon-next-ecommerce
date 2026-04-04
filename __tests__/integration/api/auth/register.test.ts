import { describe, it, expect, beforeEach } from 'vitest';
import { neon } from '@neondatabase/serverless';
import { post } from '../../../helpers/request';
import { truncateAll } from '../../../helpers/db';
import { POST } from '@/app/api/v1/auth/register/route';

const sql = neon(process.env.DATABASE_URL!);

async function createAuthUser(): Promise<string> {
  const id = crypto.randomUUID();
  await sql`INSERT INTO neon_auth."user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
            VALUES (${id}, 'Test', ${`auth-${id.slice(0, 8)}@test.com`}, false, NOW(), NOW())`;
  return id;
}

describe('POST /api/v1/auth/register', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('returns 401 when x-auth-user-id header is missing', async () => {
    const req = post('/api/v1/auth/register', {
      name: 'Ali Khan',
      email: 'ali@example.com',
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('returns 400 for invalid body (missing name)', async () => {
    const authUserId = await createAuthUser();

    const req = post(
      '/api/v1/auth/register',
      { email: 'ali@example.com' },
      { headers: { 'x-auth-user-id': authUserId } },
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 201 with user data for valid registration', async () => {
    const authUserId = await createAuthUser();

    const req = post(
      '/api/v1/auth/register',
      { name: 'Ali Khan', email: 'ali@example.com', phonePk: '0312-1234567' },
      { headers: { 'x-auth-user-id': authUserId } },
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      authUserId,
      name: 'Ali Khan',
      email: 'ali@example.com',
      phonePk: '0312-1234567',
      isActive: true,
    });
    expect(body.data.id).toBeDefined();
  });
});
