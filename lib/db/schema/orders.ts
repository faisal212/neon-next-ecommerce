import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  date,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users, addresses, adminUsers } from './users';
import { productVariants } from './catalog';

// ── Orders ───────────────────────────────────────────────────────
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: varchar('order_number', { length: 30 }).notNull(),
  userId: uuid('user_id').references(() => users.id),
  guestPhone: varchar('guest_phone', { length: 20 }),
  guestEmail: varchar('guest_email', { length: 255 }),
  addressId: uuid('address_id')
    .notNull()
    .references(() => addresses.id),
  couponId: uuid('coupon_id'),
  status: varchar('status', { length: 30 }).default('pending').notNull(),
  subtotalPkr: numeric('subtotal_pkr', { precision: 12, scale: 2 }).notNull(),
  shippingChargePkr: numeric('shipping_charge_pkr', { precision: 8, scale: 2 }).default('0').notNull(),
  codChargePkr: numeric('cod_charge_pkr', { precision: 8, scale: 2 }).default('0').notNull(),
  discountPkr: numeric('discount_pkr', { precision: 10, scale: 2 }).default('0').notNull(),
  totalPkr: numeric('total_pkr', { precision: 12, scale: 2 }).notNull(),
  customerNotes: text('customer_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('orders_order_number_idx').on(table.orderNumber),
]);

// ── Order Items ──────────────────────────────────────────────────
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  variantId: uuid('variant_id')
    .notNull()
    .references(() => productVariants.id),
  quantity: integer('quantity').notNull(),
  unitPricePkr: numeric('unit_price_pkr', { precision: 12, scale: 2 }).notNull(),
  totalPkr: numeric('total_pkr', { precision: 12, scale: 2 }).notNull(),
});

// ── Order Status History ─────────────────────────────────────────
export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  status: varchar('status', { length: 30 }).notNull(),
  notes: text('notes'),
  changedBy: uuid('changed_by')
    .references(() => adminUsers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── COD Collections ──────────────────────────────────────────────
export const codCollections = pgTable('cod_collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  amountExpectedPkr: numeric('amount_expected_pkr', { precision: 12, scale: 2 }).notNull(),
  amountCollectedPkr: numeric('amount_collected_pkr', { precision: 12, scale: 2 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  collectedBy: uuid('collected_by')
    .references(() => adminUsers.id),
  collectedAt: timestamp('collected_at', { withTimezone: true }),
  remarks: text('remarks'),
}, (table) => [
  uniqueIndex('cod_collections_order_id_idx').on(table.orderId),
]);

// ── Courier Assignments ──────────────────────────────────────────
export const courierAssignments = pgTable('courier_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  courierName: varchar('courier_name', { length: 50 }).notNull(),
  trackingNumber: varchar('tracking_number', { length: 80 }),
  riderName: varchar('rider_name', { length: 120 }),
  riderPhone: varchar('rider_phone', { length: 20 }),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  estimatedDelivery: date('estimated_delivery'),
  actualDelivery: timestamp('actual_delivery', { withTimezone: true }),
});

// ── Delivery Zones ───────────────────────────────────────────────
export const deliveryZones = pgTable('delivery_zones', {
  id: uuid('id').defaultRandom().primaryKey(),
  city: varchar('city', { length: 80 }),
  province: varchar('province', { length: 30 }).notNull(),
  shippingChargePkr: numeric('shipping_charge_pkr', { precision: 8, scale: 2 }).notNull(),
  estimatedDays: integer('estimated_days').notNull(),
  isCodAvailable: boolean('is_cod_available').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// ── Coupons ──────────────────────────────────────────────────────
export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 40 }).notNull(),
  discountType: varchar('discount_type', { length: 15 }).notNull(),
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  minOrderPkr: numeric('min_order_pkr', { precision: 10, scale: 2 }).default('0').notNull(),
  maxDiscountPkr: numeric('max_discount_pkr', { precision: 10, scale: 2 }),
  maxUses: integer('max_uses'),
  usesCount: integer('uses_count').default(0).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => [
  uniqueIndex('coupons_code_idx').on(table.code),
]);
