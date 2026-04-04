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
  inet,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { products, productVariants } from './catalog';
import { orders } from './orders';

// ── Sessions ─────────────────────────────────────────────────────
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  sessionToken: varchar('session_token', { length: 120 }).notNull(),
  ipAddress: inet('ip_address'),
  city: varchar('city', { length: 80 }),
  province: varchar('province', { length: 30 }),
  deviceType: varchar('device_type', { length: 15 }),
  os: varchar('os', { length: 30 }),
  browser: varchar('browser', { length: 40 }),
  utmSource: varchar('utm_source', { length: 80 }),
  utmMedium: varchar('utm_medium', { length: 80 }),
  utmCampaign: varchar('utm_campaign', { length: 120 }),
  utmContent: varchar('utm_content', { length: 120 }),
  referrerUrl: text('referrer_url'),
  landingPage: text('landing_page'),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('sessions_session_token_idx').on(table.sessionToken),
]);

// ── Page Views ───────────────────────────────────────────────────
export const pageViews = pgTable('page_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id),
  pageUrl: text('page_url').notNull(),
  pageType: varchar('page_type', { length: 20 }),
  entityId: uuid('entity_id'),
  timeOnPageSec: integer('time_on_page_sec'),
  viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Product Views ────────────────────────────────────────────────
export const productViews = pgTable('product_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  variantId: uuid('variant_id')
    .references(() => productVariants.id),
  viewDurationSec: integer('view_duration_sec'),
  viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Cart Events ──────────────────────────────────────────────────
export const cartEvents = pgTable('cart_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id),
  userId: uuid('user_id').references(() => users.id),
  variantId: uuid('variant_id')
    .notNull()
    .references(() => productVariants.id),
  eventType: varchar('event_type', { length: 20 }).notNull(),
  quantity: integer('quantity').notNull(),
  pricePkr: numeric('price_pkr', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Checkout Funnel ──────────────────────────────────────────────
export const checkoutFunnel = pgTable('checkout_funnel', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id),
  orderId: uuid('order_id').references(() => orders.id),
  step: varchar('step', { length: 20 }).notNull(),
  completed: boolean('completed').default(false).notNull(),
  dropReason: varchar('drop_reason', { length: 60 }),
  enteredAt: timestamp('entered_at', { withTimezone: true }).defaultNow().notNull(),
  exitedAt: timestamp('exited_at', { withTimezone: true }),
});

// ── Site Searches ────────────────────────────────────────────────
export const siteSearches = pgTable('site_searches', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id),
  query: text('query').notNull(),
  resultsCount: integer('results_count').default(0).notNull(),
  clickedProductId: uuid('clicked_product_id')
    .references(() => products.id),
  ledToOrder: boolean('led_to_order').default(false).notNull(),
  searchedAt: timestamp('searched_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Daily Product Stats ──────────────────────────────────────────
export const dailyProductStats = pgTable('daily_product_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  statDate: date('stat_date').notNull(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  views: integer('views').default(0).notNull(),
  addToCartCount: integer('add_to_cart_count').default(0).notNull(),
  ordersCount: integer('orders_count').default(0).notNull(),
  revenuePkr: numeric('revenue_pkr', { precision: 14, scale: 2 }).default('0').notNull(),
  returnsCount: integer('returns_count').default(0).notNull(),
});

// ── Daily Traffic Stats ──────────────────────────────────────────
export const dailyTrafficStats = pgTable('daily_traffic_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  statDate: date('stat_date').notNull(),
  utmSource: varchar('utm_source', { length: 80 }),
  utmMedium: varchar('utm_medium', { length: 80 }),
  province: varchar('province', { length: 30 }),
  sessionsCount: integer('sessions_count').default(0).notNull(),
  ordersCount: integer('orders_count').default(0).notNull(),
  revenuePkr: numeric('revenue_pkr', { precision: 14, scale: 2 }).default('0').notNull(),
  conversionRate: numeric('conversion_rate', { precision: 6, scale: 4 }).default('0'),
});
