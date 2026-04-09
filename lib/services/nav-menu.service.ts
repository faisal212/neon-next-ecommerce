import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { navMenuItems } from '@/lib/db/schema/marketing';
import { NotFoundError } from '@/lib/errors/api-error';

export async function listNavMenuItems() {
  return db.select().from(navMenuItems).orderBy(navMenuItems.sortOrder);
}

export async function getActiveNavMenuItems() {
  return db
    .select({ label: navMenuItems.label, href: navMenuItems.href, openInNewTab: navMenuItems.openInNewTab })
    .from(navMenuItems)
    .where(eq(navMenuItems.isActive, true))
    .orderBy(navMenuItems.sortOrder);
}

export async function getNavMenuItemById(id: string) {
  const [item] = await db
    .select()
    .from(navMenuItems)
    .where(eq(navMenuItems.id, id))
    .limit(1);

  if (!item) throw new NotFoundError('Nav menu item not found');
  return item;
}

export async function createNavMenuItem(input: Record<string, unknown>) {
  const [item] = await db
    .insert(navMenuItems)
    .values(input as typeof navMenuItems.$inferInsert)
    .returning();
  return item;
}

export async function updateNavMenuItem(id: string, input: Record<string, unknown>) {
  const [item] = await db
    .update(navMenuItems)
    .set(input)
    .where(eq(navMenuItems.id, id))
    .returning();
  if (!item) throw new NotFoundError('Nav menu item not found');
  return item;
}

export async function deleteNavMenuItem(id: string) {
  await db.delete(navMenuItems).where(eq(navMenuItems.id, id));
}
