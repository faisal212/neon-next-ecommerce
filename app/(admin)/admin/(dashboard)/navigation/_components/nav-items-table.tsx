"use client";

import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";

interface NavItemRow {
  id: string;
  label: string;
  type: string;
  href: string;
  sortOrder: number;
  isActive: boolean;
  openInNewTab: boolean;
}

const columns: Column<NavItemRow>[] = [
  {
    key: "sortOrder",
    label: "Order",
    sortable: true,
    className: "w-[70px]",
    getValue: (row) => row.sortOrder,
    render: (row) => (
      <span className="text-muted-foreground">{row.sortOrder}</span>
    ),
  },
  {
    key: "label",
    label: "Label",
    sortable: true,
    searchable: true,
    getValue: (row) => row.label,
    render: (row) => (
      <span className="font-medium text-foreground">{row.label}</span>
    ),
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
    getValue: (row) => row.type,
    render: (row) => (
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
          row.type === "category"
            ? "bg-blue-500/15 text-blue-400"
            : "bg-purple-500/15 text-purple-400"
        }`}
      >
        {row.type}
      </span>
    ),
  },
  {
    key: "href",
    label: "URL",
    searchable: true,
    getValue: (row) => row.href,
    render: (row) => (
      <span className="text-muted-foreground text-xs font-mono">
        {row.href}
      </span>
    ),
  },
  {
    key: "isActive",
    label: "Active",
    render: (row) => (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          row.isActive
            ? "bg-emerald-500/15 text-emerald-500"
            : "bg-zinc-500/15 text-zinc-400"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {row.isActive ? "Yes" : "No"}
      </span>
    ),
  },
];

export function NavItemsTable({ data }: { data: NavItemRow[] }) {
  const router = useRouter();

  return (
    <DataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search navigation items..."
      emptyMessage="No navigation items yet. Add items to customize the store navbar."
      onRowClick={(row) => router.push(`/admin/navigation/${row.id}/edit`)}
    />
  );
}
