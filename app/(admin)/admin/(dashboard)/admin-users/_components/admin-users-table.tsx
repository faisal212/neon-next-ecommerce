"use client";

import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const roleColors: Record<string, { bg: string; text: string }> = {
  super_admin: { bg: "rgba(16,185,129,0.12)", text: "rgb(52,211,153)" },
  manager: { bg: "rgba(59,130,246,0.12)", text: "rgb(96,165,250)" },
  support: { bg: "rgba(168,85,247,0.12)", text: "rgb(192,132,252)" },
  warehouse: { bg: "rgba(245,158,11,0.12)", text: "rgb(251,191,36)" },
};

function RoleBadge({ role }: { role: string }) {
  const colors = roleColors[role] || { bg: "rgba(161,161,170,0.12)", text: "rgb(161,161,170)" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {role.replace(/_/g, " ")}
    </span>
  );
}

const columns: Column<AdminUser>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
    getValue: (row) => row.name,
    render: (row) => (
      <span className="font-medium text-foreground">{row.name}</span>
    ),
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    searchable: true,
    getValue: (row) => row.email,
    render: (row) => <span className="text-zinc-400">{row.email}</span>,
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    getValue: (row) => row.role,
    render: (row) => <RoleBadge role={row.role} />,
  },
  {
    key: "active",
    label: "Active",
    sortable: true,
    getValue: (row) => (row.isActive ? "active" : "inactive"),
    render: (row) => (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
          row.isActive
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-zinc-500/10 text-zinc-400"
        }`}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
              row.isActive ? "bg-emerald-400" : "bg-zinc-500"
            }`}
          />
        </span>
        {row.isActive ? "active" : "inactive"}
      </span>
    ),
  },
  {
    key: "lastLogin",
    label: "Last Login",
    sortable: true,
    getValue: (row) =>
      row.lastLoginAt ? new Date(row.lastLoginAt).getTime() : 0,
    render: (row) => (
      <span className="text-[12px] text-zinc-500">
        {row.lastLoginAt
          ? new Date(row.lastLoginAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Never"}
      </span>
    ),
  },
  {
    key: "created",
    label: "Created",
    sortable: true,
    getValue: (row) => new Date(row.createdAt).getTime(),
    render: (row) => (
      <span className="text-[12px] text-zinc-500">
        {new Date(row.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
];

export function AdminUsersTable({ data }: { data: AdminUser[] }) {
  const router = useRouter();

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={10}
      searchPlaceholder="Search admin users by name or email..."
      emptyMessage="No admin users found"
      onRowClick={(row) => router.push(`/admin/admin-users/${row.id}`)}
    />
  );
}
