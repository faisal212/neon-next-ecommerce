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
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// ── Categories ───────────────────────────────────────────────────
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentId: uuid('parent_id'),
  nameEn: varchar('name_en', { length: 120 }).notNull(),
  nameUr: varchar('name_ur', { length: 120 }),
  slug: varchar('slug', { length: 160 }).notNull(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isEcosystemFeatured: boolean('is_ecosystem_featured').default(false).notNull(),
  ecosystemOrder: integer('ecosystem_order').default(0).notNull(),
}, (table) => [
  uniqueIndex('categories_slug_idx').on(table.slug),
]);

// ── Products ─────────────────────────────────────────────────────
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id),
  nameEn: varchar('name_en', { length: 200 }).notNull(),
  nameUr: varchar('name_ur', { length: 200 }),
  slug: varchar('slug', { length: 220 }).notNull(),
  descriptionEn: text('description_en'),
  descriptionUr: text('description_ur'),
  basePricePkr: numeric('base_price_pkr', { precision: 12, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('products_slug_idx').on(table.slug),
]);

// ── Product Variants ─────────────────────────────────────────────
export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  sku: varchar('sku', { length: 80 }).notNull(),
  color: varchar('color', { length: 60 }),
  size: varchar('size', { length: 30 }),
  extraPricePkr: numeric('extra_price_pkr', { precision: 10, scale: 2 }).default('0'),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => [
  uniqueIndex('product_variants_sku_idx').on(table.sku),
]);

// ── Product Images ───────────────────────────────────────────────
export const productImages = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  variantId: uuid('variant_id')
    .references(() => productVariants.id),
  url: text('url').notNull(),
  altText: varchar('alt_text', { length: 200 }),
  isPrimary: boolean('is_primary').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

// ── Inventory ────────────────────────────────────────────────────
export const inventory = pgTable('inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  variantId: uuid('variant_id')
    .notNull()
    .references(() => productVariants.id),
  quantityOnHand: integer('quantity_on_hand').default(0).notNull(),
  quantityReserved: integer('quantity_reserved').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(5).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('inventory_variant_id_idx').on(table.variantId),
]);

// ── Product Tags ─────────────────────────────────────────────────
export const productTags = pgTable('product_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  tag: varchar('tag', { length: 80 }).notNull(),
});

// ── Reviews ──────────────────────────────────────────────────────
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  orderItemId: uuid('order_item_id').notNull(),
  rating: smallint('rating').notNull(),
  comment: text('comment'),
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
