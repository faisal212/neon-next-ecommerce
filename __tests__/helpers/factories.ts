import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/lib/db/schema';
import { users, addresses, adminUsers } from '@/lib/db/schema/users';
import { categories, products, productVariants, inventory } from '@/lib/db/schema/catalog';
import { carts, cartItems } from '@/lib/db/schema/cart';
import { coupons, deliveryZones, orders, orderItems, orderStatusHistory, codCollections } from '@/lib/db/schema/orders';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ── Neon Auth seed (must exist before users/admin_users) ─────────
async function seedNeonAuthUser(): Promise<string> {
  const id = crypto.randomUUID();
  await sql`INSERT INTO neon_auth."user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
            VALUES (${id}, 'Test Auth User', ${`auth-${id.slice(0, 8)}@test.com`}, false, NOW(), NOW())
            ON CONFLICT DO NOTHING`;
  return id;
}

// ── Users ────────────────────────────────────────────────────────
export async function seedUser(overrides?: Partial<typeof users.$inferInsert>) {
  const authUserId = await seedNeonAuthUser();
  const [user] = await db.insert(users).values({
    authUserId,
    firstName: 'Test',
    lastName: 'User',
    email: `test-${crypto.randomUUID().slice(0, 8)}@example.com`,
    phonePk: `0312-${Math.floor(1000000 + Math.random() * 9000000)}`,
    ...overrides,
  }).returning();
  return user;
}

export async function seedAdmin(overrides?: Partial<typeof adminUsers.$inferInsert>) {
  const authUserId = await seedNeonAuthUser();
  const [admin] = await db.insert(adminUsers).values({
    authUserId,
    name: 'Test Admin',
    email: `admin-${crypto.randomUUID().slice(0, 8)}@example.com`,
    role: 'super_admin',
    ...overrides,
  }).returning();
  return admin;
}

export async function seedAddress(userId: string, overrides?: Partial<typeof addresses.$inferInsert>) {
  const [address] = await db.insert(addresses).values({
    userId,
    fullName: 'Test User',
    phonePk: '0312-1234567',
    addressLine1: '123 Main St',
    city: 'Lahore',
    province: 'Punjab',
    ...overrides,
  }).returning();
  return address;
}

// ── Catalog ──────────────────────────────────────────────────────
export async function seedCategory(overrides?: Partial<typeof categories.$inferInsert>) {
  const slug = `cat-${crypto.randomUUID().slice(0, 8)}`;
  const [category] = await db.insert(categories).values({
    nameEn: 'Test Category',
    slug,
    ...overrides,
  }).returning();
  return category;
}

export async function seedProduct(categoryId: string, overrides?: Partial<typeof products.$inferInsert>) {
  const slug = `product-${crypto.randomUUID().slice(0, 8)}`;
  const [product] = await db.insert(products).values({
    categoryId,
    nameEn: 'Test Product',
    slug,
    basePricePkr: '1000.00',
    isPublished: true,
    ...overrides,
  }).returning();
  return product;
}

export async function seedVariantWithStock(productId: string, stock: number = 10, overrides?: Partial<typeof productVariants.$inferInsert>) {
  const sku = `SKU-${crypto.randomUUID().slice(0, 8)}`;
  const [variant] = await db.insert(productVariants).values({
    productId,
    sku,
    ...overrides,
  }).returning();

  await db.insert(inventory).values({
    variantId: variant.id,
    quantityOnHand: stock,
    quantityReserved: 0,
    lowStockThreshold: 5,
  });

  return variant;
}

// ── Cart ─────────────────────────────────────────────────────────
export async function seedCartWithItems(userId: string | null, items: { variantId: string; quantity: number; unitPrice: string }[]) {
  const sessionToken = `session-${crypto.randomUUID().slice(0, 8)}`;
  const [cart] = await db.insert(carts).values({
    userId,
    sessionToken,
    status: 'active',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }).returning();

  for (const item of items) {
    await db.insert(cartItems).values({
      cartId: cart.id,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPricePkr: item.unitPrice,
    });
  }

  return { cart, sessionToken };
}

// ── Orders ───────────────────────────────────────────────────────
export async function seedCoupon(overrides?: Partial<typeof coupons.$inferInsert>) {
  const code = `COUPON${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const [coupon] = await db.insert(coupons).values({
    code,
    discountType: 'flat_pkr',
    discountValue: '200.00',
    minOrderPkr: '500.00',
    ...overrides,
  }).returning();
  return coupon;
}

export async function seedDeliveryZone(overrides?: Partial<typeof deliveryZones.$inferInsert>) {
  const [zone] = await db.insert(deliveryZones).values({
    city: 'Lahore',
    province: 'Punjab',
    shippingChargePkr: '150.00',
    estimatedDays: 3,
    isCodAvailable: true,
    ...overrides,
  }).returning();
  return zone;
}

export async function seedOrder(userId: string, addressId: string, overrides?: Partial<typeof orders.$inferInsert>) {
  const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const [order] = await db.insert(orders).values({
    orderNumber,
    userId,
    addressId,
    status: 'pending',
    subtotalPkr: '2000.00',
    shippingChargePkr: '150.00',
    codChargePkr: '50.00',
    discountPkr: '0.00',
    totalPkr: '2200.00',
    ...overrides,
  }).returning();

  await db.insert(orderStatusHistory).values({ orderId: order.id, status: 'pending', notes: 'Order placed' });
  await db.insert(codCollections).values({ orderId: order.id, amountExpectedPkr: order.totalPkr, status: 'pending' });

  return order;
}
