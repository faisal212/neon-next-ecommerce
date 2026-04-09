"use client";

import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: string;
  minOrderPkr: string;
  maxDiscountPkr: string | null;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  isActive: boolean;
  status: string;
}

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-400",
  Inactive: "bg-red-500/10 text-red-400",
  Expired: "bg-amber-500/10 text-amber-400",
  "Limit Reached": "bg-amber-500/10 text-amber-400",
};

const columns: Column<Coupon>[] = [
  {
    key: "code",
    label: "Code",
    sortable: true,
    searchable: true,
    getValue: (row) => row.code,
    render: (row) => (
      <span className="font-mono text-[12px] font-semibold tracking-wide text-foreground">
        {row.code}
      </span>
    ),
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
    getValue: (row) => row.discountType,
    render: (row) => (
      <span className="text-zinc-400">
        {row.discountType === "flat_pkr" ? "Flat PKR" : "Percentage"}
      </span>
    ),
  },
  {
    key: "value",
    label: "Value",
    sortable: true,
    getValue: (row) => Number(row.discountValue),
    render: (row) => (
      <span className="font-mono text-[12px] text-zinc-400">
        {row.discountType === "flat_pkr"
          ? `Rs. ${Number(row.discountValue).toLocaleString("en-PK")}`
          : `${Number(row.discountValue)}%`}
      </span>
    ),
  },
  {
    key: "minOrder",
    label: "Min Order",
    sortable: true,
    getValue: (row) => Number(row.minOrderPkr),
    render: (row) => (
      <span className="font-mono text-[12px] text-zinc-500">
        Rs. {Number(row.minOrderPkr).toLocaleString("en-PK")}
      </span>
    ),
  },
  {
    key: "uses",
    label: "Max Uses / Used",
    sortable: true,
    getValue: (row) => row.usesCount,
    render: (row) => (
      <span className="text-[12px] text-zinc-400">
        {row.maxUses != null ? `${row.usesCount} / ${row.maxUses}` : `${row.usesCount} / \u221E`}
      </span>
    ),
  },
  {
    key: "expires",
    label: "Expires",
    sortable: true,
    getValue: (row) => (row.expiresAt ? new Date(row.expiresAt).getTime() : Infinity),
    render: (row) =>
      row.expiresAt ? (
        <span className="text-[12px] text-zinc-500">
          {new Date(row.expiresAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ) : (
        <span className="text-[12px] text-zinc-600">Never</span>
      ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    getValue: (row) => row.status,
    render: (row) => (
      <span
        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${
          statusStyles[row.status] || "bg-zinc-500/10 text-zinc-400"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

export function CouponsTable({ data }: { data: Coupon[] }) {
  const router = useRouter();

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={10}
      searchPlaceholder="Search coupons by code..."
      emptyMessage="No coupons yet — create your first one"
      onRowClick={(row) => router.push(`/admin/coupons/${row.id}/edit`)}
    />
  );
}
