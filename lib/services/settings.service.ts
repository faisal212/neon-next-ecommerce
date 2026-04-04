import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { appSettings } from '@/lib/db/schema/support';
import { NotFoundError } from '@/lib/errors/api-error';

export async function getSetting(key: string) {
  const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
  if (!setting) throw new NotFoundError(`Setting '${key}' not found`);
  return setting;
}

export async function getSettingValue<T = unknown>(key: string, defaultValue?: T): Promise<T> {
  const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
  if (!setting) {
    if (defaultValue !== undefined) return defaultValue;
    throw new NotFoundError(`Setting '${key}' not found`);
  }
  return setting.value as T;
}

export async function upsertSetting(key: string, value: unknown, description: string | undefined, adminId: string) {
  const [existing] = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);

  if (existing) {
    const [updated] = await db.update(appSettings).set({
      value,
      description: description ?? existing.description,
      updatedBy: adminId,
      updatedAt: new Date(),
    }).where(eq(appSettings.key, key)).returning();
    return updated;
  }

  const [created] = await db.insert(appSettings).values({
    key,
    value,
    description: description ?? null,
    updatedBy: adminId,
  }).returning();
  return created;
}

export async function listSettings() {
  return db.select().from(appSettings);
}
