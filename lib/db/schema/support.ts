import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  smallint,
  timestamp,
  jsonb,
  inet,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users, adminUsers } from './users';
import { orders, orderItems } from './orders';

// ── Return Requests ──────────────────────────────────────────────
export const returnRequests = pgTable('return_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  reason: varchar('reason', { length: 60 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  resolution: varchar('resolution', { length: 20 }),
  handledBy: uuid('handled_by')
    .references(() => adminUsers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});

// ── Return Items ─────────────────────────────────────────────────
export const returnItems = pgTable('return_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  returnRequestId: uuid('return_request_id')
    .notNull()
    .references(() => returnRequests.id),
  orderItemId: uuid('order_item_id')
    .notNull()
    .references(() => orderItems.id),
  quantity: integer('quantity').notNull(),
  condition: varchar('condition', { length: 20 }).notNull(),
});

// ── OTP Verifications ────────────────────────────────────────────
export const otpVerifications = pgTable('otp_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  phonePk: varchar('phone_pk', { length: 20 }).notNull(),
  otpCode: varchar('otp_code', { length: 64 }).notNull(),
  purpose: varchar('purpose', { length: 20 }).notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  attempts: smallint('attempts').default(0).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Notification Templates ───────────────────────────────────────
export const notificationTemplates = pgTable('notification_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 80 }).notNull(),
  channel: varchar('channel', { length: 15 }).notNull(),
  subject: varchar('subject', { length: 200 }),
  body: text('body').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('notification_templates_key_idx').on(table.key),
]);

// ── Notification Logs ────────────────────────────────────────────
export const notificationLogs = pgTable('notification_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id),
  templateId: uuid('template_id')
    .notNull()
    .references(() => notificationTemplates.id),
  channel: varchar('channel', { length: 15 }).notNull(),
  recipient: varchar('recipient', { length: 255 }).notNull(),
  status: varchar('status', { length: 15 }).default('queued').notNull(),
  provider: varchar('provider', { length: 40 }),
  providerRef: varchar('provider_ref', { length: 120 }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
});

// ── Support Tickets ──────────────────────────────────────────────
export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketNumber: varchar('ticket_number', { length: 20 }).notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  orderId: uuid('order_id')
    .references(() => orders.id),
  category: varchar('category', { length: 40 }).notNull(),
  subject: varchar('subject', { length: 200 }).notNull(),
  status: varchar('status', { length: 20 }).default('open').notNull(),
  priority: varchar('priority', { length: 10 }).default('medium').notNull(),
  assignedTo: uuid('assigned_to')
    .references(() => adminUsers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
}, (table) => [
  uniqueIndex('support_tickets_ticket_number_idx').on(table.ticketNumber),
]);

// ── Ticket Messages ──────────────────────────────────────────────
export const ticketMessages = pgTable('ticket_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => supportTickets.id),
  senderType: varchar('sender_type', { length: 10 }).notNull(),
  senderId: uuid('sender_id').notNull(),
  message: text('message').notNull(),
  attachments: jsonb('attachments'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Admin Activity Logs ──────────────────────────────────────────
export const adminActivityLogs = pgTable('admin_activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: uuid('admin_id')
    .notNull()
    .references(() => adminUsers.id),
  action: varchar('action', { length: 80 }).notNull(),
  entityType: varchar('entity_type', { length: 40 }).notNull(),
  entityId: uuid('entity_id'),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  ipAddress: inet('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── App Settings ─────────────────────────────────────────────────
export const appSettings = pgTable('app_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedBy: uuid('updated_by')
    .references(() => adminUsers.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('app_settings_key_idx').on(table.key),
]);
