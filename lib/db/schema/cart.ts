import {
  pgTable,
  uuid,
  varchar,
  integer,
  numeric,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { productVariants } from './catalog';

// ── Carts ────────────────────────────────────────────────────────
export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  sessionToken: varchar('session_token', { length: 120 }).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex('carts_session_token_idx').on(table.sessionToken),
]);

// ── Cart Items ───────────────────────────────────────────────────
export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id')
    .notNull()
    .references(() => carts.id),
  variantId: uuid('variant_id')
    .notNull()
    .references(() => productVariants.id),
  quantity: integer('quantity').notNull(),
  unitPricePkr: numeric('unit_price_pkr', { precision: 12, scale: 2 }).notNull(),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Cart Merge Log ───────────────────────────────────────────────
export const cartMergeLog = pgTable('cart_merge_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  guestCartId: uuid('guest_cart_id')
    .notNull()
    .references(() => carts.id),
  userCartId: uuid('user_cart_id')
    .notNull()
    .references(() => carts.id),
  itemsMerged: integer('items_merged').notNull(),
  strategy: varchar('strategy', { length: 30 }).notNull(),
  mergedAt: timestamp('merged_at', { withTimezone: true }).defaultNow().notNull(),
});
