import { describe, it, expect, beforeEach } from 'vitest';
import { truncateAll } from '../../helpers/db';
import { seedCategory, seedProduct, seedVariantWithStock } from '../../helpers/factories';
import { getInventory, updateStock, reserveStock, releaseStock } from '@/lib/services/inventory.service';

describe('Inventory Service (integration)', () => {
  let variantId: string;

  beforeEach(async () => {
    await truncateAll();
    const category = await seedCategory();
    const product = await seedProduct(category.id);
    const variant = await seedVariantWithStock(product.id, 20);
    variantId = variant.id;
  });

  it('returns inventory with available count', async () => {
    const inv = await getInventory(variantId);
    expect(inv.quantityOnHand).toBe(20);
    expect(inv.quantityReserved).toBe(0);
    expect(inv.available).toBe(20);
  });

  it('updates stock quantity', async () => {
    const inv = await updateStock(variantId, { quantityOnHand: 50 });
    expect(inv.quantityOnHand).toBe(50);
  });

  it('reserves stock and reduces available', async () => {
    const inv = await reserveStock(variantId, 5);
    expect(inv.quantityReserved).toBe(5);

    const check = await getInventory(variantId);
    expect(check.available).toBe(15);
  });

  it('rejects reservation when insufficient stock', async () => {
    await expect(reserveStock(variantId, 25)).rejects.toThrow('Insufficient stock');
  });

  it('reserves exact available amount', async () => {
    const inv = await reserveStock(variantId, 20);
    expect(inv.quantityReserved).toBe(20);

    const check = await getInventory(variantId);
    expect(check.available).toBe(0);
  });

  it('rejects reservation when all stock already reserved', async () => {
    await reserveStock(variantId, 20);
    await expect(reserveStock(variantId, 1)).rejects.toThrow('Insufficient stock');
  });

  it('releases reserved stock', async () => {
    await reserveStock(variantId, 10);
    const inv = await releaseStock(variantId, 5);

    expect(inv.quantityReserved).toBe(5);
    const check = await getInventory(variantId);
    expect(check.available).toBe(15);
  });

  it('release does not go below 0', async () => {
    await reserveStock(variantId, 5);
    const inv = await releaseStock(variantId, 100); // over-release
    expect(inv.quantityReserved).toBe(0);
  });

  it('multiple sequential reservations accumulate', async () => {
    await reserveStock(variantId, 5);
    await reserveStock(variantId, 5);
    await reserveStock(variantId, 5);

    const inv = await getInventory(variantId);
    expect(inv.quantityReserved).toBe(15);
    expect(inv.available).toBe(5);
  });
});
