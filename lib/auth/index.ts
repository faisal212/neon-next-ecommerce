import { eq } from 'drizzle-orm';
import { auth } from './better-auth';
import { db } from '@/lib/db';
import { users, adminUsers } from '@/lib/db/schema/users';
import { AuthenticationError, ForbiddenError } from '@/lib/errors/api-error';

export interface AuthUser {
  id: string;
  authUserId: string;
  name: string | null;
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
 * Neon Auth reads the session cookie automatically in Next.js server context.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
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
    name: user.name,
    email: user.email,
    phonePk: user.phonePk,
    isPhoneVerified: user.isPhoneVerified,
    isActive: user.isActive,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError();
  if (!user.isActive) throw new ForbiddenError('Account is deactivated');
  return user;
}

export async function requireAdmin(allowedRoles?: string[]): Promise<AdminUser> {
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
