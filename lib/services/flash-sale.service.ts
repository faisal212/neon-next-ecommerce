import { eq, and, lte, gte, sql, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { flashSales, flashSaleProducts } from '@/lib/db/schema/marketing';
import { NotFoundError } from '@/lib/errors/api-error';

export async function listFlashSales() {
  return db.select().from(flashSales).orderBy(desc(flashSales.startsAt));
}

export async function getActiveFlashSales() {
  const now = new Date();
  return db.select().from(flashSales).where(
    and(eq(flashSales.isActive, true), lte(flashSales.startsAt, now), gte(flashSales.endsAt, now)),
  );
}

export async function createFlashSale(input: typeof flashSales.$inferInsert) {
  const [sale] = await db.insert(flashSales).values(input).returning();
  return sale;
}

export async function updateFlashSale(id: string, input: Partial<typeof flashSales.$inferInsert>) {
  const [sale] = await db.update(flashSales).set(input).where(eq(flashSales.id, id)).returning();
  if (!sale) throw new NotFoundError('Flash sale not found');
  return sale;
}

export async function addFlashSaleProduct(flashSaleId: string, input: { productId: string; overridePricePkr?: string; stockLimit?: number }) {
  const [item] = await db.insert(flashSaleProducts).values({
    flashSaleId,
    productId: input.productId,
    overridePricePkr: input.overridePricePkr ?? null,
    stockLimit: input.stockLimit ?? null,
  }).returning();
  return item;
}

export async function getFlashSaleProducts(flashSaleId: string) {
  return db.select().from(flashSaleProducts).where(eq(flashSaleProducts.flashSaleId, flashSaleId));
}
