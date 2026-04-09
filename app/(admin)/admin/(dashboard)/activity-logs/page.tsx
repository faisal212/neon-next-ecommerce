import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminActivityLogs } from "@/lib/db/schema/support";
import { adminUsers } from "@/lib/db/schema/users";
import { PageHeader } from "../../_components/page-header";
import { ActivityLogsTable } from "./_components/activity-logs-table";

export default async function ActivityLogsPage() {
  const logs = await db
    .select({
      id: adminActivityLogs.id,
      adminId: adminActivityLogs.adminId,
      adminName: adminUsers.name,
      action: adminActivityLogs.action,
      entityType: adminActivityLogs.entityType,
      entityId: adminActivityLogs.entityId,
      oldValue: adminActivityLogs.oldValue,
      newValue: adminActivityLogs.newValue,
      ipAddress: adminActivityLogs.ipAddress,
      createdAt: adminActivityLogs.createdAt,
    })
    .from(adminActivityLogs)
    .leftJoin(adminUsers, eq(adminActivityLogs.adminId, adminUsers.id))
    .orderBy(desc(adminActivityLogs.createdAt))
    .limit(200);

  const serialized = logs.map((log) => ({
    ...log,
    adminName: log.adminName ?? "Unknown",
    entityId: log.entityId ?? null,
    oldValue: log.oldValue as Record<string, unknown> | null,
    newValue: log.newValue as Record<string, unknown> | null,
    ipAddress: log.ipAddress ?? null,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Activity Logs"
        subtitle={`Showing ${serialized.length} most recent entries`}
      />
      <ActivityLogsTable data={serialized} />
    </>
  );
}
