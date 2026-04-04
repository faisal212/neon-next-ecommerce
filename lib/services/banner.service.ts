import { eq, and, lte, gte, or, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { banners } from '@/lib/db/schema/marketing';
import { NotFoundError } from '@/lib/errors/api-error';

export async function getActiveBanners(placement?: string, province?: string) {
  const now = new Date();
  const conditions = [
    eq(banners.isActive, true),
    or(isNull(banners.startsAt), lte(banners.startsAt, now)),
    or(isNull(banners.endsAt), gte(banners.endsAt, now)),
  ];

  if (placement) conditions.push(eq(banners.placement, placement));
  if (province) conditions.push(or(isNull(banners.targetProvince), eq(banners.targetProvince, province)));

  return db.select().from(banners).where(and(...conditions)).orderBy(banners.sortOrder);
}

export async function createBanner(input: Record<string, unknown>) {
  const [banner] = await db.insert(banners).values(input as typeof banners.$inferInsert).returning();
  return banner;
}

export async function updateBanner(id: string, input: Record<string, unknown>) {
  const [banner] = await db.update(banners).set(input).where(eq(banners.id, id)).returning();
  if (!banner) throw new NotFoundError('Banner not found');
  return banner;
}
