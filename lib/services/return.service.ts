import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { returnRequests, returnItems } from '@/lib/db/schema/support';
import { orders } from '@/lib/db/schema/orders';
import { users } from '@/lib/db/schema/users';
import { NotFoundError, ValidationError } from '@/lib/errors/api-error';
import type { PaginationParams } from '@/lib/utils/pagination';

export async function createReturnRequest(userId: string, input: {
  orderId: string;
  reason: string;
  description?: string;
  items: { orderItemId: string; quantity: number; condition: string }[];
}) {
  // Verify order belongs to user and is delivered
  const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  if (!order) throw new NotFoundError('Order not found');
  if (order.userId !== userId) throw new ValidationError('Order does not belong to you');
  if (order.status !== 'delivered') throw new ValidationError('Only delivered orders can be returned');

  const [request] = await db.insert(returnRequests).values({
    orderId: input.orderId,
    userId,
    reason: input.reason,
    description: input.description ?? null,
  }).returning();

  // Add return items
  if (input.items.length > 0) {
    await db.insert(returnItems).values(
      input.items.map((item) => ({
        returnRequestId: request.id,
        orderItemId: item.orderItemId,
        quantity: item.quantity,
        condition: item.condition,
      })),
    );
  }

  return request;
}

export async function getReturnRequest(id: string) {
  const [request] = await db.select().from(returnRequests).where(eq(returnRequests.id, id)).limit(1);
  if (!request) throw new NotFoundError('Return request not found');

  const items = await db.select().from(returnItems).where(eq(returnItems.returnRequestId, id));
  return { ...request, items };
}

export async function listUserReturns(userId: string, pagination: PaginationParams) {
  const where = eq(returnRequests.userId, userId);
  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(returnRequests).where(where);
  const data = await db.select().from(returnRequests).where(where).orderBy(desc(returnRequests.createdAt)).limit(pagination.limit).offset(pagination.offset);
  return { data, total: countResult?.count ?? 0 };
}

export async function listAllReturns(pagination: PaginationParams, statusFilter?: string) {
  const conditions = [];

  if (statusFilter) {
    conditions.push(eq(returnRequests.status, statusFilter));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(returnRequests)
    .where(where);

  const data = await db
    .select({
      id: returnRequests.id,
      orderId: returnRequests.orderId,
      userId: returnRequests.userId,
      reason: returnRequests.reason,
      description: returnRequests.description,
      status: returnRequests.status,
      resolution: returnRequests.resolution,
      handledBy: returnRequests.handledBy,
      createdAt: returnRequests.createdAt,
      resolvedAt: returnRequests.resolvedAt,
      customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as('customer_name'),
      customerEmail: users.email,
      orderNumber: orders.orderNumber,
    })
    .from(returnRequests)
    .leftJoin(users, eq(returnRequests.userId, users.id))
    .leftJoin(orders, eq(returnRequests.orderId, orders.id))
    .where(where)
    .orderBy(desc(returnRequests.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return { data, total: countResult?.count ?? 0 };
}

export async function updateReturnStatus(id: string, status: string, resolution?: string, adminId?: string) {
  const updates: Record<string, unknown> = { status };
  if (resolution) updates.resolution = resolution;
  if (adminId) updates.handledBy = adminId;
  if (status === 'completed') updates.resolvedAt = new Date();

  const [request] = await db.update(returnRequests).set(updates).where(eq(returnRequests.id, id)).returning();
  if (!request) throw new NotFoundError('Return request not found');
  return request;
}
