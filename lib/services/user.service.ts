import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { ConflictError, NotFoundError } from '@/lib/errors/api-error';
import type { RegisterInput, UpdateProfileInput } from '@/lib/validators/user.validators';

export async function createUser(authUserId: string, input: RegisterInput) {
  // Check for existing user with same auth_user_id
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authUserId, authUserId))
    .limit(1);

  if (existing) {
    throw new ConflictError('User profile already exists');
  }

  // Check for duplicate email
  const [emailExists] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (emailExists) {
    throw new ConflictError('Email already registered');
  }

  const [user] = await db
    .insert(users)
    .values({
      authUserId,
      name: input.name,
      email: input.email,
      phonePk: input.phonePk ?? null,
    })
    .returning();

  return user;
}

export async function getUserById(id: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function getUserByAuthId(authUserId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authUserId))
    .limit(1);

  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function updateUser(id: string, input: UpdateProfileInput) {
  const [user] = await db
    .update(users)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function deactivateUser(id: string) {
  const [user] = await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  if (!user) throw new NotFoundError('User not found');
  return user;
}
