import { db } from '@/lib/db';
import { adminActivityLogs } from '@/lib/db/schema/support';

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
