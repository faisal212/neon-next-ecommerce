import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { products, productVariants } from './catalog';
import { orders } from './orders';
import { sessions } from './analytics';

// ── Wishlists ────────────────────────────────────────────────────
export const wishlists = pgTable('wishlists', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name', { length: 120 }).default('My Wishlist').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Wishlist Items ───────────────────────────────────────────────
export const wishlistItems = pgTable('wishlist_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  wishlistId: uuid('wishlist_id')
    .notNull()
    .references(() => wishlists.id),
  variantId: uuid('variant_id')
    .notNull()
    .references(() => productVariants.id),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Banners ──────────────────────────────────────────────────────
export const banners = pgTable('banners', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  imageUrl: text('image_url').notNull(),
  linkUrl: text('link_url'),
  placement: varchar('placement', { length: 40 }).notNull(),
  targetProvince: varchar('target_province', { length: 30 }),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
});

// ── Flash Sales ──────────────────────────────────────────────────
export const flashSales = pgTable('flash_sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  discountType: varchar('discount_type', { length: 15 }).notNull(),
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// ── Flash Sale Products ──────────────────────────────────────────
export const flashSaleProducts = pgTable('flash_sale_products', {
  id: uuid('id').defaultRandom().primaryKey(),
  flashSaleId: uuid('flash_sale_id')
    .notNull()
    .references(() => flashSales.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  overridePricePkr: numeric('override_price_pkr', { precision: 12, scale: 2 }),
  stockLimit: integer('stock_limit'),
  unitsSold: integer('units_sold').default(0).notNull(),
});

// ── Loyalty Points ───────────────────────────────────────────────
export const loyaltyPoints = pgTable('loyalty_points', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  totalEarned: integer('total_earned').default(0).notNull(),
  totalRedeemed: integer('total_redeemed').default(0).notNull(),
  balance: integer('balance').default(0).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('loyalty_points_user_id_idx').on(table.userId),
]);

// ── Points Transactions ──────────────────────────────────────────
export const pointsTransactions = pgTable('points_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  orderId: uuid('order_id')
    .references(() => orders.id),
  type: varchar('type', { length: 15 }).notNull(),
  points: integer('points').notNull(),
  description: varchar('description', { length: 200 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Referrals ────────────────────────────────────────────────────
export const referrals = pgTable('referrals', {
  id: uuid('id').defaultRandom().primaryKey(),
  referrerUserId: uuid('referrer_user_id')
    .notNull()
    .references(() => users.id),
  referredUserId: uuid('referred_user_id')
    .notNull()
    .references(() => users.id),
  referralCode: varchar('referral_code', { length: 20 }).notNull(),
  rewardGiven: boolean('reward_given').default(false).notNull(),
  rewardPoints: integer('reward_points').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('referrals_referral_code_idx').on(table.referralCode),
]);

// ── Recently Viewed ──────────────────────────────────────────────
export const recentlyViewed = pgTable('recently_viewed', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
});
