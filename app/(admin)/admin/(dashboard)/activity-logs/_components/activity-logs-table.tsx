"use client";

import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";

interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

const actionColors: Record<string, { bg: string; text: string }> = {
  create: { bg: "rgba(16,185,129,0.12)", text: "rgb(52,211,153)" },
  update: { bg: "rgba(59,130,246,0.12)", text: "rgb(96,165,250)" },
  delete: { bg: "rgba(239,68,68,0.12)", text: "rgb(248,113,113)" },
};

function getActionColor(action: string) {
  const key = action.toLowerCase();
  if (key.includes("create") || key.includes("add") || key.includes("insert")) {
    return actionColors.create;
  }
  if (key.includes("delete") || key.includes("remove")) {
    return actionColors.delete;
  }
  if (key.includes("update") || key.includes("edit") || key.includes("change")) {
    return actionColors.update;
  }
  return { bg: "rgba(161,161,170,0.12)", text: "rgb(161,161,170)" };
}

const columns: Column<ActivityLog>[] = [
  {
    key: "adminName",
    label: "Admin",
    sortable: true,
    searchable: true,
    getValue: (row) => row.adminName,
    render: (row) => (
      <span className="font-medium text-foreground">{row.adminName}</span>
    ),
  },
  {
    key: "action",
    label: "Action",
    sortable: true,
    searchable: true,
    getValue: (row) => row.action,
    render: (row) => {
      const colors = getActionColor(row.action);
      return (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {row.action}
        </span>
      );
    },
  },
  {
    key: "entityType",
    label: "Entity Type",
    sortable: true,
    searchable: true,
    getValue: (row) => row.entityType,
    render: (row) => (
      <span className="text-[13px] text-zinc-400">{row.entityType}</span>
    ),
  },
  {
    key: "entityId",
    label: "Entity ID",
    searchable: true,
    getValue: (row) => row.entityId ?? "",
    render: (row) => (
      <span className="font-mono text-[12px] text-zinc-500">
        {row.entityId ? row.entityId.slice(0, 8) + "..." : "—"}
      </span>
    ),
  },
  {
    key: "changes",
    label: "Changes",
    render: (row) => (
      <div className="flex flex-col gap-0.5">
        {row.oldValue && (
          <span className="text-[11px] leading-tight text-red-400/70">
            - {JSON.stringify(row.oldValue).slice(0, 50)}
            {JSON.stringify(row.oldValue).length > 50 ? "..." : ""}
          </span>
        )}
        {row.newValue && (
          <span className="text-[11px] leading-tight text-emerald-400/70">
            + {JSON.stringify(row.newValue).slice(0, 50)}
            {JSON.stringify(row.newValue).length > 50 ? "..." : ""}
          </span>
        )}
        {!row.oldValue && !row.newValue && (
          <span className="text-[11px] text-zinc-600">—</span>
        )}
      </div>
    ),
  },
  {
    key: "timestamp",
    label: "Timestamp",
    sortable: true,
    getValue: (row) => new Date(row.createdAt).getTime(),
    render: (row) => (
      <span className="text-[12px] text-zinc-500">
        {new Date(row.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  },
];

export function ActivityLogsTable({ data }: { data: ActivityLog[] }) {
  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={20}
      searchPlaceholder="Search logs by admin, action, or entity..."
      emptyMessage="No activity logs recorded"
    />
  );
}
