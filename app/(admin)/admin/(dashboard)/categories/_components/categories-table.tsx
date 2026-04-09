"use client";

import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";
import { StatusBadge } from "../../../_components/status-badge";

interface Category {
  id: string;
  nameEn: string;
  nameUr: string | null;
  slug: string;
  parentName: string;
  sortOrder: number;
  isActive: boolean;
}

const columns: Column<Category>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
    getValue: (row) => row.nameEn,
    render: (row) => (
      <div>
        <span className="font-medium text-foreground">{row.nameEn}</span>
        {row.nameUr && (
          <span className="ml-2 text-[11px] text-zinc-500" dir="rtl">
            {row.nameUr}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "slug",
    label: "Slug",
    searchable: true,
    getValue: (row) => row.slug,
    render: (row) => (
      <span className="font-mono text-[11px] text-zinc-500">{row.slug}</span>
    ),
  },
  {
    key: "parent",
    label: "Parent",
    sortable: true,
    getValue: (row) => row.parentName,
    render: (row) => (
      <span className="text-zinc-400">{row.parentName}</span>
    ),
  },
  {
    key: "order",
    label: "Order",
    sortable: true,
    getValue: (row) => row.sortOrder,
    render: (row) => (
      <span className="text-zinc-500">{row.sortOrder}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <StatusBadge status={row.isActive ? "active" : "inactive"} />
    ),
  },
];

export function CategoriesTable({ data }: { data: Category[] }) {
  const router = useRouter();

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={15}
      searchPlaceholder="Search categories..."
      emptyMessage="No categories yet"
      onRowClick={(row) => router.push(`/admin/categories/${row.id}/edit`)}
    />
  );
}
