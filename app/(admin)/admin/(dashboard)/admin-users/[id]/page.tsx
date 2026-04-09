import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema/users";
import { adminActivityLogs } from "@/lib/db/schema/support";
import { BackLink } from "../../../_components/back-link";
import { AdminUserEdit } from "../_components/admin-user-edit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  params: Promise<{ id: string }>;
}

const roleColors: Record<string, { bg: string; text: string }> = {
  super_admin: { bg: "rgba(16,185,129,0.12)", text: "rgb(52,211,153)" },
  manager: { bg: "rgba(59,130,246,0.12)", text: "rgb(96,165,250)" },
  support: { bg: "rgba(168,85,247,0.12)", text: "rgb(192,132,252)" },
  warehouse: { bg: "rgba(245,158,11,0.12)", text: "rgb(251,191,36)" },
};

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);

  if (!admin) notFound();

  const recentActivity = await db
    .select({
      id: adminActivityLogs.id,
      action: adminActivityLogs.action,
      entityType: adminActivityLogs.entityType,
      entityId: adminActivityLogs.entityId,
      createdAt: adminActivityLogs.createdAt,
    })
    .from(adminActivityLogs)
    .where(eq(adminActivityLogs.adminId, admin.id))
    .orderBy(desc(adminActivityLogs.createdAt))
    .limit(10);

  const colors = roleColors[admin.role] || {
    bg: "rgba(161,161,170,0.12)",
    text: "rgb(161,161,170)",
  };

  return (
    <>
      <BackLink href="/admin/admin-users" label="Back to Admin Users" />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{admin.name}</h1>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {admin.role.replace(/_/g, " ")}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            admin.isActive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-zinc-500/10 text-zinc-400"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                admin.isActive ? "bg-emerald-400" : "bg-zinc-500"
              }`}
            />
          </span>
          {admin.isActive ? "active" : "inactive"}
        </span>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Profile info */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Full Name
                </div>
                <div className="mt-0.5 text-[13px]">{admin.name}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Email
                </div>
                <div className="mt-0.5 text-[13px]">{admin.email}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Last Login
                </div>
                <div className="mt-0.5 text-[13px]">
                  {admin.lastLoginAt
                    ? new Date(admin.lastLoginAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Created
                </div>
                <div className="mt-0.5 text-[13px]">
                  {new Date(admin.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">
              Recent Activity
              {recentActivity.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({recentActivity.length})
                </span>
              )}
            </h3>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No activity recorded yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Action
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Entity Type
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Entity ID
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((log) => (
                    <TableRow
                      key={log.id}
                      className="border-border/50 transition-colors duration-150 hover:bg-white/[0.02]"
                    >
                      <TableCell className="text-[13px] font-medium text-foreground">
                        {log.action}
                      </TableCell>
                      <TableCell className="text-[13px] text-zinc-400">
                        {log.entityType}
                      </TableCell>
                      <TableCell className="font-mono text-[12px] text-zinc-500">
                        {log.entityId ? log.entityId.slice(0, 8) + "..." : "—"}
                      </TableCell>
                      <TableCell className="text-[12px] text-zinc-500">
                        {new Date(log.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Edit Role & Status */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Manage</h3>
            <AdminUserEdit
              adminId={admin.id}
              initialRole={admin.role}
              initialIsActive={admin.isActive}
            />
          </div>
        </div>
      </div>
    </>
  );
}
