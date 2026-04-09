import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema/users';
import { NotFoundError } from '@/lib/errors/api-error';

export async function listAdminUsers() {
  return db.select().from(adminUsers).orderBy(adminUsers.name);
}

export async function getAdminUserById(id: string) {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);

  if (!admin) throw new NotFoundError('Admin user not found');
  return admin;
}

export async function updateAdminUser(id: string, input: { role?: string; isActive?: boolean }) {
  const [admin] = await db
    .update(adminUsers)
    .set(input)
    .where(eq(adminUsers.id, id))
    .returning();

  if (!admin) throw new NotFoundError('Admin user not found');
  return admin;
}
