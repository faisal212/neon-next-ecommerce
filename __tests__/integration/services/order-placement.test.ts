import { describe, it, expect, beforeEach } from 'vitest';
import { truncateAll } from '../../helpers/db';
import {
  seedUser,
  seedAddress,
  seedCategory,
  seedProduct,
  seedVariantWithStock,
  seedCartWithItems,
  seedCoupon,
  seedDeliveryZone,
} from '../../helpers/factories';
import { placeOrder, getOrderByNumber } from '@/lib/services/order.service';
import { getInventory } from '@/lib/services/inventory.service';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { carts } from '@/lib/db/schema/cart';
import { coupons } from '@/lib/db/schema/orders';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

describe('Order Placement (integration)', () => {
  let userId: string;
  let addressId: string;
  let variantId: string;
  let sessionToken: string;

  beforeEach(async () => {
    await truncateAll();

    const user = await seedUser();
    userId = user.id;

    const address = await seedAddress(userId, { city: 'Lahore' });
    addressId = address.id;

    await seedDeliveryZone({ city: 'Lahore', shippingChargePkr: '150.00' });

    const category = await seedCategory();
    const product = await seedProduct(category.id, { basePricePkr: '1000.00' });
    const variant = await seedVariantWithStock(product.id, 10);
    variantId = variant.id;

    const result = await seedCartWithItems(userId, [
      { variantId: variant.id, quantity: 2, unitPrice: '1000.00' },
    ]);
    sessionToken = result.sessionToken;
  });

  it('places an order and returns order with number', async () => {
    const order = await placeOrder(userId, sessionToken, { addressId });

    expect(order.orderNumber).toMatch(/^ORD-\d{8}-/);
    expect(order.status).toBe('pending');
    expect(order.userId).toBe(userId);
    expect(order.addressId).toBe(addressId);
  });

  it('calculates correct totals (subtotal + shipping + COD - discount)', async () => {
    const order = await placeOrder(userId, sessionToken, { addressId });

    // 2 items x 1000 = 2000 subtotal + 150 shipping + 50 COD = 2200
    expect(parseFloat(order.subtotalPkr)).toBe(2000);
    expect(parseFloat(order.shippingChargePkr)).toBe(150);
    expect(parseFloat(order.codChargePkr)).toBe(50);
    expect(parseFloat(order.discountPkr)).toBe(0);
    expect(parseFloat(order.totalPkr)).toBe(2200);
  });

  it('reserves inventory after order placement', async () => {
    await placeOrder(userId, sessionToken, { addressId });

    const inv = await getInventory(variantId);
    expect(inv.quantityOnHand).toBe(10);
    expect(inv.quantityReserved).toBe(2);
    expect(inv.available).toBe(8);
  });

  it('converts cart to "converted" status', async () => {
    await placeOrder(userId, sessionToken, { addressId });

    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    expect(cart.status).toBe('converted');
  });

  it('creates order items with correct price snapshots', async () => {
    const order = await placeOrder(userId, sessionToken, { addressId });

    const fullOrder = await getOrderByNumber(order.orderNumber, userId);
    expect(fullOrder.items).toHaveLength(1);
    expect(fullOrder.items[0].quantity).toBe(2);
    expect(parseFloat(fullOrder.items[0].unitPricePkr)).toBe(1000);
    expect(parseFloat(fullOrder.items[0].totalPkr)).toBe(2000);
  });

  it('creates initial status history entry', async () => {
    const order = await placeOrder(userId, sessionToken, { addressId });

    const fullOrder = await getOrderByNumber(order.orderNumber, userId);
    expect(fullOrder.statusHistory).toHaveLength(1);
    expect(fullOrder.statusHistory[0].status).toBe('pending');
  });

  it('creates COD collection record', async () => {
    const order = await placeOrder(userId, sessionToken, { addressId });

    const fullOrder = await getOrderByNumber(order.orderNumber, userId);
    expect(fullOrder.cod).not.toBeNull();
    expect(fullOrder.cod!.status).toBe('pending');
    expect(parseFloat(fullOrder.cod!.amountExpectedPkr)).toBe(2200);
  });

  it('applies coupon and reduces total', async () => {
    const coupon = await seedCoupon({
      discountType: 'flat_pkr',
      discountValue: '300.00',
      minOrderPkr: '1000.00',
    });

    const order = await placeOrder(userId, sessionToken, {
      addressId,
      couponCode: coupon.code,
    });

    expect(parseFloat(order.discountPkr)).toBe(300);
    // 2000 + 150 + 50 - 300 = 1900
    expect(parseFloat(order.totalPkr)).toBe(1900);
  });

  it('increments coupon usage after order', async () => {
    const coupon = await seedCoupon({
      discountType: 'flat_pkr',
      discountValue: '100.00',
      minOrderPkr: '0.00',
      usesCount: 3,
    });

    await placeOrder(userId, sessionToken, { addressId, couponCode: coupon.code });

    // Check coupon usage incremented
    const [updated] = await db.select().from(coupons).where(eq(coupons.id, coupon.id));
    expect(updated.usesCount).toBe(4);
  });

  it('rejects order when cart is empty', async () => {
    // Create user with empty cart
    const user2 = await seedUser();
    const addr2 = await seedAddress(user2.id);
    await seedCartWithItems(user2.id, []);

    await expect(
      placeOrder(user2.id, `user-${user2.id}`, { addressId: addr2.id }),
    ).rejects.toThrow('Cart is empty');
  });

  it('rejects order when no active cart exists', async () => {
    const user2 = await seedUser();
    const addr2 = await seedAddress(user2.id);

    await expect(
      placeOrder(user2.id, `user-${user2.id}`, { addressId: addr2.id }),
    ).rejects.toThrow('No active cart');
  });

  it('rejects order when stock is insufficient', async () => {
    // Create cart with more items than available stock
    const user2 = await seedUser();
    const addr2 = await seedAddress(user2.id, { city: 'Lahore' });
    const { sessionToken: st2 } = await seedCartWithItems(user2.id, [
      { variantId, quantity: 15, unitPrice: '1000.00' }, // only 10 in stock
    ]);

    await expect(
      placeOrder(user2.id, st2, { addressId: addr2.id }),
    ).rejects.toThrow('Insufficient stock');
  });

  it('rolls back inventory reservation on stock failure (atomic)', async () => {
    // Seed second variant with only 1 in stock
    const category = await seedCategory();
    const product2 = await seedProduct(category.id, { basePricePkr: '500.00' });
    const variant2 = await seedVariantWithStock(product2.id, 1);

    // Cart with 2 items: first succeeds, second fails
    const user2 = await seedUser();
    const addr2 = await seedAddress(user2.id, { city: 'Lahore' });
    const { sessionToken: st2 } = await seedCartWithItems(user2.id, [
      { variantId, quantity: 2, unitPrice: '1000.00' },      // 10 avail — OK
      { variantId: variant2.id, quantity: 5, unitPrice: '500.00' },  // 1 avail — FAIL
    ]);

    await expect(
      placeOrder(user2.id, st2, { addressId: addr2.id }),
    ).rejects.toThrow('Insufficient stock');

    // First variant's reservation should have been rolled back
    const inv = await getInventory(variantId);
    expect(inv.quantityReserved).toBe(0); // rolled back
  });

  it('supports guest checkout with phone', async () => {
    // Create guest cart
    const category = await seedCategory();
    const product = await seedProduct(category.id, { basePricePkr: '800.00' });
    const variant = await seedVariantWithStock(product.id, 5);
    const guestAddr = await seedAddress(null as unknown as string, { city: 'Lahore', isGuest: true, userId: null });

    const { sessionToken: guestSt } = await seedCartWithItems(null, [
      { variantId: variant.id, quantity: 1, unitPrice: '800.00' },
    ]);

    const order = await placeOrder(null, guestSt, {
      addressId: guestAddr.id,
      guestPhone: '0312-9876543',
      guestEmail: 'guest@example.com',
    });

    expect(order.userId).toBeNull();
    expect(order.guestPhone).toBe('0312-9876543');
    expect(order.guestEmail).toBe('guest@example.com');
  });

  it('rejects guest checkout without phone', async () => {
    const category = await seedCategory();
    const product = await seedProduct(category.id);
    const variant = await seedVariantWithStock(product.id, 5);
    const guestAddr = await seedAddress(null as unknown as string, { city: 'Lahore', isGuest: true, userId: null });

    const { sessionToken: guestSt } = await seedCartWithItems(null, [
      { variantId: variant.id, quantity: 1, unitPrice: '1000.00' },
    ]);

    await expect(
      placeOrder(null, guestSt, { addressId: guestAddr.id }),
    ).rejects.toThrow('Phone number required');
  });
});
