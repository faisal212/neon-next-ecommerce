import {
  pgTable,
  pgSchema,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ── Neon Auth managed table (read-only) ──────────────────────────
const neonAuthSchema = pgSchema('neon_auth');

export const neonAuthUsersSync = neonAuthSchema.table('user', {
  id: uuid('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  emailVerified: boolean('emailVerified'),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true }),
  updatedAt: timestamp('updatedAt', { withTimezone: true }),
  role: text('role'),
  banned: boolean('banned'),
  banReason: text('banReason'),
  banExpires: timestamp('banExpires', { withTimezone: true }),
});

// ── Users (profile extension of Neon Auth) ───────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  authUserId: uuid('auth_user_id')
    .notNull()
    .references(() => neonAuthUsersSync.id),
  firstName: varchar('first_name', { length: 60 }).notNull(),
  lastName: varchar('last_name', { length: 60 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phonePk: varchar('phone_pk', { length: 20 }),
  isPhoneVerified: boolean('is_phone_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('users_auth_user_id_idx').on(table.authUserId),
  uniqueIndex('users_email_idx').on(table.email),
  uniqueIndex('users_phone_pk_idx').on(table.phonePk),
]);

// ── Addresses ────────────────────────────────────────────────────
export const addresses = pgTable('addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  firstName: varchar('first_name', { length: 60 }).notNull(),
  lastName: varchar('last_name', { length: 60 }).notNull(),
  phonePk: varchar('phone_pk', { length: 20 }).notNull(),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: varchar('city', { length: 80 }).notNull(),
  province: varchar('province', { length: 30 }).notNull(),
  postalCode: varchar('postal_code', { length: 10 }),
  isDefault: boolean('is_default').default(false).notNull(),
  isGuest: boolean('is_guest').default(false).notNull(),
});

// ── Admin Users ──────────────────────────────────────────────────
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  authUserId: uuid('auth_user_id')
    .notNull()
    .references(() => neonAuthUsersSync.id),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 30 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('admin_users_auth_user_id_idx').on(table.authUserId),
  uniqueIndex('admin_users_email_idx').on(table.email),
]);
