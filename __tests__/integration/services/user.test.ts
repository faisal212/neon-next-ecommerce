import { describe, it, expect, beforeEach } from 'vitest';
import { truncateAll } from '../../helpers/db';
import { seedUser, seedAddress } from '../../helpers/factories';
import { createUser, getUserById, getUserByAuthId, updateUser, deactivateUser } from '@/lib/services/user.service';
import { createAddress, listAddresses, updateAddress, deleteAddress } from '@/lib/services/address.service';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function createAuthUser(): Promise<string> {
  const id = crypto.randomUUID();
  await sql`INSERT INTO neon_auth."user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
            VALUES (${id}, 'Test', ${`auth-${id.slice(0, 8)}@test.com`}, false, NOW(), NOW())`;
  return id;
}

describe('User Service (integration)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('creates a user profile linked to auth user', async () => {
    const authId = await createAuthUser();
    const user = await createUser(authId, { name: 'Ali Khan', email: 'ali@example.com' });
    expect(user.authUserId).toBe(authId);
    expect(user.name).toBe('Ali Khan');
    expect(user.email).toBe('ali@example.com');
    expect(user.isActive).toBe(true);
  });

  it('rejects duplicate auth_user_id', async () => {
    const authId = await createAuthUser();
    await createUser(authId, { name: 'Ali', email: 'ali@example.com' });
    await expect(
      createUser(authId, { name: 'Ali2', email: 'ali2@example.com' }),
    ).rejects.toThrow('already exists');
  });

  it('rejects duplicate email', async () => {
    const authId1 = await createAuthUser();
    const authId2 = await createAuthUser();
    await createUser(authId1, { name: 'Ali', email: 'same@example.com' });
    await expect(
      createUser(authId2, { name: 'Ahmed', email: 'same@example.com' }),
    ).rejects.toThrow('already registered');
  });

  it('gets user by ID', async () => {
    const user = await seedUser();
    const found = await getUserById(user.id);
    expect(found.id).toBe(user.id);
  });

  it('gets user by auth ID', async () => {
    const user = await seedUser();
    const found = await getUserByAuthId(user.authUserId);
    expect(found.id).toBe(user.id);
  });

  it('throws NotFoundError for missing user', async () => {
    await expect(getUserById(crypto.randomUUID())).rejects.toThrow('not found');
  });

  it('updates user profile', async () => {
    const user = await seedUser();
    const updated = await updateUser(user.id, { name: 'New Name' });
    expect(updated.name).toBe('New Name');
  });

  it('deactivates user', async () => {
    const user = await seedUser();
    const deactivated = await deactivateUser(user.id);
    expect(deactivated.isActive).toBe(false);
  });
});

describe('Address Service (integration)', () => {
  let userId: string;

  beforeEach(async () => {
    await truncateAll();
    const user = await seedUser();
    userId = user.id;
  });

  it('creates an address for a user', async () => {
    const addr = await createAddress(userId, {
      fullName: 'Ali Khan',
      phonePk: '0312-1234567',
      addressLine1: '123 Main St',
      city: 'Lahore',
      province: 'Punjab',
    });
    expect(addr.userId).toBe(userId);
    expect(addr.city).toBe('Lahore');
    expect(addr.isGuest).toBe(false);
  });

  it('lists addresses for a user', async () => {
    await createAddress(userId, { fullName: 'A', phonePk: '0312-1234567', addressLine1: 'St 1', city: 'Lahore', province: 'Punjab' });
    await createAddress(userId, { fullName: 'B', phonePk: '0312-7654321', addressLine1: 'St 2', city: 'Karachi', province: 'Sindh' });
    const list = await listAddresses(userId);
    expect(list).toHaveLength(2);
  });

  it('setting isDefault clears other defaults', async () => {
    const addr1 = await createAddress(userId, { fullName: 'A', phonePk: '0312-1234567', addressLine1: 'St 1', city: 'Lahore', province: 'Punjab', isDefault: true });
    const addr2 = await createAddress(userId, { fullName: 'B', phonePk: '0312-7654321', addressLine1: 'St 2', city: 'Karachi', province: 'Sindh', isDefault: true });

    const list = await listAddresses(userId);
    const defaults = list.filter(a => a.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0].id).toBe(addr2.id);
  });

  it('updates an address', async () => {
    const addr = await createAddress(userId, { fullName: 'A', phonePk: '0312-1234567', addressLine1: 'St 1', city: 'Lahore', province: 'Punjab' });
    const updated = await updateAddress(addr.id, userId, { city: 'Islamabad', province: 'ICT' });
    expect(updated.city).toBe('Islamabad');
    expect(updated.province).toBe('ICT');
  });

  it('deletes an address', async () => {
    const addr = await createAddress(userId, { fullName: 'A', phonePk: '0312-1234567', addressLine1: 'St 1', city: 'Lahore', province: 'Punjab' });
    await deleteAddress(addr.id, userId);
    const list = await listAddresses(userId);
    expect(list).toHaveLength(0);
  });

  it('cannot delete another user\'s address', async () => {
    const addr = await createAddress(userId, { fullName: 'A', phonePk: '0312-1234567', addressLine1: 'St 1', city: 'Lahore', province: 'Punjab' });
    await expect(deleteAddress(addr.id, crypto.randomUUID())).rejects.toThrow('not found');
  });
});
