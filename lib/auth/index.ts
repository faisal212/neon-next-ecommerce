import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { connection } from 'next/server';
import { auth } from './better-auth';
import { db } from '@/lib/db';
import { users, adminUsers } from '@/lib/db/schema/users';
import { AuthenticationError, ForbiddenError } from '@/lib/errors/api-error';

export interface AuthUser {
  id: string;
  authUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phonePk: string | null;
  isPhoneVerified: boolean;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  authUserId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

/**
 * Get current user from Neon Auth session.
 *
 * Wrapped in React `cache()` so multiple server components in the same render
 * pass (e.g. several Suspense islands on one page) share a single session read
 * + DB lookup. This is the Data Access Layer (DAL) pattern from the Next.js 16
 * authentication guide — called inside any component that needs user data,
 * deduped per request, and is the real security check (proxy.ts only does an
 * optimistic cookie-existence check).
 *
 * Neon Auth reads the session cookie automatically in Next.js server context.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  // Opt out of prerendering — reads cookies via session.
  await connection();
  const { data: session } = await auth.getSession();

  if (!session?.user) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, session.user.id))
    .limit(1);

  if (!user) return null;

  return {
    id: user.id,
    authUserId: user.authUserId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phonePk: user.phonePk,
    isPhoneVerified: user.isPhoneVerified,
    isActive: user.isActive,
  };
});

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError();
  if (!user.isActive) throw new ForbiddenError('Account is deactivated');
  return user;
}

/**
 * Returns the Neon Auth user id from the active session cookie, without
 * joining to the `users` profile table. Used during signup — the moment
 * Neon Auth has created the auth identity but we haven't yet inserted
 * the matching row into `public.users`. `getCurrentUser` / `requireAuth`
 * would return null in that window because they require a joined row.
 */
export async function requireAuthUserId(): Promise<string> {
  await connection();
  const { data: session } = await auth.getSession();
  if (!session?.user) throw new AuthenticationError();
  return session.user.id;
}

export async function requireAdmin(allowedRoles?: string[]): Promise<AdminUser> {
  // Opt out of prerendering — reads cookies via session.
  await connection();
  const { data: session } = await auth.getSession();

  if (!session?.user) throw new AuthenticationError();

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.authUserId, session.user.id))
    .limit(1);

  if (!admin) throw new ForbiddenError('Admin access required');
  if (!admin.isActive) throw new ForbiddenError('Admin account is deactivated');
  if (allowedRoles && !allowedRoles.includes(admin.role)) {
    throw new ForbiddenError(`Role '${admin.role}' is not authorized for this action`);
  }

  return {
    id: admin.id,
    authUserId: admin.authUserId,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
  };
}
