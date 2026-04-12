import { eq, and, or, ilike, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { orders } from '@/lib/db/schema/orders';
import { ConflictError, NotFoundError } from '@/lib/errors/api-error';
import type { RegisterInput, UpdateProfileInput } from '@/lib/validators/user.validators';
import type { PaginationParams } from '@/lib/utils/pagination';

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
      firstName: input.firstName,
      lastName: input.lastName,
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

export async function listUsers(pagination: PaginationParams, search?: string) {
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        // Match against "first last" concatenation so a single search
        // box works for either half of the name or the whole thing.
        sql`${users.firstName} || ' ' || ${users.lastName} ILIKE ${'%' + search + '%'}`,
        ilike(users.email, `%${search}%`),
        ilike(users.phonePk, `%${search}%`),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(where);

  const data = await db
    .select({
      id: users.id,
      authUserId: users.authUserId,
      firstName: users.firstName,
      lastName: users.lastName,
      // Computed column so existing callers consuming `row.name` keep working.
      name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as('name'),
      email: users.email,
      phonePk: users.phonePk,
      isPhoneVerified: users.isPhoneVerified,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      orderCount: sql<number>`count(${orders.id})::int`,
      totalSpend: sql<string>`coalesce(sum(${orders.totalPkr}), '0')`,
    })
    .from(users)
    .leftJoin(orders, eq(users.id, orders.userId))
    .where(where)
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return { data, total: countResult?.count ?? 0 };
}
