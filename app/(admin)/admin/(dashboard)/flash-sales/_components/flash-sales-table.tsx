"use client";

import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";

interface SaleRow {
  id: string;
  name: string;
  discountType: string;
  discountValue: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  productCount: number;
}

function getSaleStatus(sale: { startsAt: string; endsAt: string; isActive: boolean }) {
  if (!sale.isActive) return { label: "Inactive", color: "bg-zinc-500/15 text-zinc-400" };
  const now = new Date();
  if (now < new Date(sale.startsAt)) return { label: "Scheduled", color: "bg-cyan-500/15 text-cyan-500" };
  if (now > new Date(sale.endsAt)) return { label: "Ended", color: "bg-zinc-500/15 text-zinc-400" };
  return { label: "Active", color: "bg-emerald-500/15 text-emerald-500" };
}

const columns: Column<SaleRow>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
    getValue: (row) => row.name,
    render: (row) => <span className="font-medium text-foreground">{row.name}</span>,
  },
  {
    key: "discount",
    label: "Discount",
    render: (row) =>
      row.discountType === "percentage"
        ? `${row.discountValue}% off`
        : `Rs. ${Number(row.discountValue).toLocaleString("en-PK")} flat`,
  },
  {
    key: "startsAt",
    label: "Starts",
    sortable: true,
    getValue: (row) => new Date(row.startsAt).getTime(),
    render: (row) =>
      new Date(row.startsAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
  {
    key: "endsAt",
    label: "Ends",
    sortable: true,
    getValue: (row) => new Date(row.endsAt).getTime(),
    render: (row) =>
      new Date(row.endsAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => {
      const status = getSaleStatus(row);
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.color}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {status.label}
        </span>
      );
    },
  },
  {
    key: "productCount",
    label: "Products",
    sortable: true,
    getValue: (row) => row.productCount,
    render: (row) => row.productCount,
  },
];

export function FlashSalesTable({ data }: { data: SaleRow[] }) {
  const router = useRouter();

  return (
    <DataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search flash sales..."
      emptyMessage="No flash sales yet"
      onRowClick={(row) => router.push(`/admin/flash-sales/${row.id}`)}
    />
  );
}
