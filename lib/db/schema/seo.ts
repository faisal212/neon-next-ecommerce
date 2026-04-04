import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  smallint,
  numeric,
  timestamp,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { products, categories } from './catalog';

// ── Product SEO ──────────────────────────────────────────────────
export const productSeo = pgTable('product_seo', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  metaTitle: varchar('meta_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 180 }),
  ogTitle: text('og_title'),
  ogDescription: text('og_description'),
  ogImageUrl: text('og_image_url'),
  canonicalUrl: text('canonical_url'),
  schemaMarkup: jsonb('schema_markup'),
  robots: varchar('robots', { length: 30 }).default('index,follow'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('product_seo_product_id_idx').on(table.productId),
]);

// ── Category SEO ─────────────────────────────────────────────────
export const categorySeo = pgTable('category_seo', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id),
  metaTitle: varchar('meta_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 180 }),
  ogImageUrl: text('og_image_url'),
  canonicalUrl: text('canonical_url'),
  h1Override: varchar('h1_override', { length: 200 }),
  topContent: text('top_content'),
  bottomContent: text('bottom_content'),
  robots: varchar('robots', { length: 30 }).default('index,follow'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('category_seo_category_id_idx').on(table.categoryId),
]);

// ── Static Page SEO ──────────────────────────────────────────────
export const staticPageSeo = pgTable('static_page_seo', {
  id: uuid('id').defaultRandom().primaryKey(),
  pageKey: varchar('page_key', { length: 50 }).notNull(),
  metaTitle: varchar('meta_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 180 }),
  ogImageUrl: text('og_image_url'),
  canonicalUrl: text('canonical_url'),
  robots: varchar('robots', { length: 30 }).default('index,follow'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('static_page_seo_page_key_idx').on(table.pageKey),
]);

// ── URL Redirects ────────────────────────────────────────────────
export const urlRedirects = pgTable('url_redirects', {
  id: uuid('id').defaultRandom().primaryKey(),
  fromPath: text('from_path').notNull(),
  toPath: text('to_path').notNull(),
  redirectType: smallint('redirect_type').default(301).notNull(),
  hitCount: integer('hit_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('url_redirects_from_path_idx').on(table.fromPath),
]);

// ── Sitemap Entries ──────────────────────────────────────────────
export const sitemapEntries = pgTable('sitemap_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull(),
  entityType: varchar('entity_type', { length: 20 }).notNull(),
  entityId: uuid('entity_id'),
  changeFreq: varchar('change_freq', { length: 15 }).default('weekly'),
  priority: numeric('priority', { precision: 2, scale: 1 }).default('0.5'),
  lastModified: timestamp('last_modified', { withTimezone: true }).defaultNow(),
  isExcluded: boolean('is_excluded').default(false).notNull(),
}, (table) => [
  uniqueIndex('sitemap_entries_url_idx').on(table.url),
]);
