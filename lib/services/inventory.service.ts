import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { inventory } from '@/lib/db/schema/catalog';
import { NotFoundError, ConflictError } from '@/lib/errors/api-error';
import type { UpdateInventoryInput } from '@/lib/validators/product.validators';

export async function getInventory(variantId: string) {
  const [inv] = await db
    .select()
    .from(inventory)
    .where(eq(inventory.variantId, variantId))
    .limit(1);

  if (!inv) throw new NotFoundError('Inventory record not found');

  return {
    ...inv,
    available: inv.quantityOnHand - inv.quantityReserved,
  };
}

export async function updateStock(variantId: string, input: UpdateInventoryInput) {
  const [inv] = await db
    .update(inventory)
    .set({
      quantityOnHand: input.quantityOnHand,
      lowStockThreshold: input.lowStockThreshold,
      updatedAt: new Date(),
    })
    .where(eq(inventory.variantId, variantId))
    .returning();

  if (!inv) throw new NotFoundError('Inventory record not found');
  return inv;
}

export async function reserveStock(variantId: string, quantity: number) {
  // Atomic: only reserve if enough available
  const result = await db
    .update(inventory)
    .set({
      quantityReserved: sql`${inventory.quantityReserved} + ${quantity}`,
      updatedAt: new Date(),
    })
    .where(
      and_available(variantId, quantity),
    )
    .returning();

  if (result.length === 0) {
    throw new ConflictError('Insufficient stock');
  }

  return result[0];
}

export async function releaseStock(variantId: string, quantity: number) {
  const [inv] = await db
    .update(inventory)
    .set({
      quantityReserved: sql`GREATEST(${inventory.quantityReserved} - ${quantity}, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(inventory.variantId, variantId))
    .returning();

  if (!inv) throw new NotFoundError('Inventory record not found');
  return inv;
}

export async function checkLowStock() {
  return db
    .select()
    .from(inventory)
    .where(
      sql`${inventory.quantityOnHand} - ${inventory.quantityReserved} <= ${inventory.lowStockThreshold}`,
    );
}

// Helper: SQL condition for "has enough available stock"
function and_available(variantId: string, quantity: number) {
  return sql`${inventory.variantId} = ${variantId} AND ${inventory.quantityOnHand} - ${inventory.quantityReserved} >= ${quantity}`;
}
