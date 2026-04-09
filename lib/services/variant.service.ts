import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productVariants, inventory } from '@/lib/db/schema/catalog';
import { NotFoundError, ConflictError } from '@/lib/errors/api-error';
import type { CreateVariantInput } from '@/lib/validators/product.validators';

export async function listVariants(productId: string) {
  return db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
}

export async function createVariant(productId: string, input: CreateVariantInput) {
  // Check SKU uniqueness
  const [existing] = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.sku, input.sku))
    .limit(1);

  if (existing) throw new ConflictError(`SKU '${input.sku}' already exists`);

  const [variant] = await db
    .insert(productVariants)
    .values({
      productId,
      sku: input.sku,
      color: input.color ?? null,
      size: input.size ?? null,
      extraPricePkr: input.extraPricePkr ?? '0',
      isActive: input.isActive ?? true,
    })
    .returning();

  // Auto-create inventory record
  await db.insert(inventory).values({
    variantId: variant.id,
    quantityOnHand: 0,
    quantityReserved: 0,
    lowStockThreshold: 5,
  });

  return variant;
}

export async function updateVariant(id: string, input: Partial<CreateVariantInput>) {
  // If updating SKU, check uniqueness
  if (input.sku) {
    const [existing] = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.sku, input.sku))
      .limit(1);

    if (existing && existing.id !== id) {
      throw new ConflictError(`SKU '${input.sku}' already exists`);
    }
  }

  const [variant] = await db
    .update(productVariants)
    .set(input)
    .where(eq(productVariants.id, id))
    .returning();

  if (!variant) throw new NotFoundError('Variant not found');
  return variant;
}

export async function deleteVariant(id: string) {
  // Delete related inventory record first (FK constraint)
  await db.delete(inventory).where(eq(inventory.variantId, id));

  const [variant] = await db
    .delete(productVariants)
    .where(eq(productVariants.id, id))
    .returning();

  if (!variant) throw new NotFoundError('Variant not found');
  return variant;
}
