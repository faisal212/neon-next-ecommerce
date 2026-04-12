import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { supportTickets, ticketMessages } from '@/lib/db/schema/support';
import { users } from '@/lib/db/schema/users';
import { NotFoundError } from '@/lib/errors/api-error';
import { generateTicketNumber } from '@/lib/utils/order-number';
import type { PaginationParams } from '@/lib/utils/pagination';

export async function createTicket(userId: string, input: {
  orderId?: string;
  category: string;
  subject: string;
  message: string;
  priority?: string;
}) {
  const [ticket] = await db.insert(supportTickets).values({
    ticketNumber: generateTicketNumber(),
    userId,
    orderId: input.orderId ?? null,
    category: input.category,
    subject: input.subject,
    priority: input.priority ?? 'medium',
  }).returning();

  // Add initial message
  await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    senderType: 'customer',
    senderId: userId,
    message: input.message,
  });

  return ticket;
}

export async function getTicket(ticketId: string) {
  const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1);
  if (!ticket) throw new NotFoundError('Ticket not found');

  const messages = await db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticketId)).orderBy(ticketMessages.createdAt);
  return { ...ticket, messages };
}

export async function listUserTickets(userId: string, pagination: PaginationParams) {
  const where = eq(supportTickets.userId, userId);
  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(supportTickets).where(where);
  const data = await db.select().from(supportTickets).where(where).orderBy(desc(supportTickets.createdAt)).limit(pagination.limit).offset(pagination.offset);
  return { data, total: countResult?.count ?? 0 };
}

export async function addMessage(ticketId: string, senderId: string, senderType: 'customer' | 'admin', message: string, attachments?: unknown) {
  const [msg] = await db.insert(ticketMessages).values({
    ticketId,
    senderType,
    senderId,
    message,
    attachments: attachments ?? null,
  }).returning();

  return msg;
}

export async function listAllTickets(pagination: PaginationParams, statusFilter?: string, priorityFilter?: string) {
  const conditions = [];

  if (statusFilter) {
    conditions.push(eq(supportTickets.status, statusFilter));
  }

  if (priorityFilter) {
    conditions.push(eq(supportTickets.priority, priorityFilter));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(supportTickets)
    .where(where);

  const data = await db
    .select({
      id: supportTickets.id,
      ticketNumber: supportTickets.ticketNumber,
      userId: supportTickets.userId,
      orderId: supportTickets.orderId,
      category: supportTickets.category,
      subject: supportTickets.subject,
      status: supportTickets.status,
      priority: supportTickets.priority,
      assignedTo: supportTickets.assignedTo,
      createdAt: supportTickets.createdAt,
      resolvedAt: supportTickets.resolvedAt,
      customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as('customer_name'),
      customerEmail: users.email,
    })
    .from(supportTickets)
    .leftJoin(users, eq(supportTickets.userId, users.id))
    .where(where)
    .orderBy(desc(supportTickets.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return { data, total: countResult?.count ?? 0 };
}

export async function updateTicketStatus(ticketId: string, status: string, assignedTo?: string) {
  const updates: Record<string, unknown> = { status };
  if (assignedTo) updates.assignedTo = assignedTo;
  if (status === 'resolved') updates.resolvedAt = new Date();

  const [ticket] = await db.update(supportTickets).set(updates).where(eq(supportTickets.id, ticketId)).returning();
  if (!ticket) throw new NotFoundError('Ticket not found');
  return ticket;
}
