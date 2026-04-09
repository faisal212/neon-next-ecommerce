import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { deliveryZones } from '@/lib/db/schema/orders';
import { NotFoundError } from '@/lib/errors/api-error';

export async function listZones() {
  return db.select().from(deliveryZones).orderBy(deliveryZones.city);
}

export async function createZone(input: typeof deliveryZones.$inferInsert) {
  const [zone] = await db.insert(deliveryZones).values(input).returning();
  return zone;
}

export async function updateZone(id: string, input: Partial<typeof deliveryZones.$inferInsert>) {
  const [zone] = await db
    .update(deliveryZones)
    .set(input)
    .where(eq(deliveryZones.id, id))
    .returning();

  if (!zone) throw new NotFoundError('Delivery zone not found');
  return zone;
}

export async function deleteZone(id: string) {
  const [zone] = await db
    .delete(deliveryZones)
    .where(eq(deliveryZones.id, id))
    .returning();

  if (!zone) throw new NotFoundError('Delivery zone not found');
}
