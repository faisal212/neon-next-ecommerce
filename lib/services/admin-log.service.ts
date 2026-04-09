import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminActivityLogs } from '@/lib/db/schema/support';
import { adminUsers } from '@/lib/db/schema/users';
import type { PaginationParams } from '@/lib/utils/pagination';

export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  oldValue?: unknown,
  newValue?: unknown,
  ipAddress?: string,
) {
  await db.insert(adminActivityLogs).values({
    adminId,
    action,
    entityType,
    entityId,
    oldValue: oldValue ?? null,
    newValue: newValue ?? null,
    ipAddress: ipAddress ?? null,
  });
}

export async function listActivityLogs(pagination: PaginationParams, filters?: {
  adminId?: string;
  action?: string;
  entityType?: string;
}) {
  const conditions = [];

  if (filters?.adminId) {
    conditions.push(eq(adminActivityLogs.adminId, filters.adminId));
  }

  if (filters?.action) {
    conditions.push(eq(adminActivityLogs.action, filters.action));
  }

  if (filters?.entityType) {
    conditions.push(eq(adminActivityLogs.entityType, filters.entityType));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(adminActivityLogs)
    .where(where);

  const data = await db
    .select({
      id: adminActivityLogs.id,
      adminId: adminActivityLogs.adminId,
      action: adminActivityLogs.action,
      entityType: adminActivityLogs.entityType,
      entityId: adminActivityLogs.entityId,
      oldValue: adminActivityLogs.oldValue,
      newValue: adminActivityLogs.newValue,
      ipAddress: adminActivityLogs.ipAddress,
      createdAt: adminActivityLogs.createdAt,
      adminName: adminUsers.name,
    })
    .from(adminActivityLogs)
    .leftJoin(adminUsers, eq(adminActivityLogs.adminId, adminUsers.id))
    .where(where)
    .orderBy(desc(adminActivityLogs.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return { data, total: countResult?.count ?? 0 };
}
