import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { notificationTemplates } from '@/lib/db/schema/support';
import { NotFoundError } from '@/lib/errors/api-error';

export async function listTemplates() {
  return db.select().from(notificationTemplates).orderBy(notificationTemplates.key);
}

export async function getTemplate(id: string) {
  const [t] = await db
    .select()
    .from(notificationTemplates)
    .where(eq(notificationTemplates.id, id))
    .limit(1);

  if (!t) throw new NotFoundError('Notification template not found');
  return t;
}

export async function updateTemplate(id: string, input: Record<string, unknown>) {
  const [t] = await db
    .update(notificationTemplates)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(notificationTemplates.id, id))
    .returning();

  if (!t) throw new NotFoundError('Notification template not found');
  return t;
}
