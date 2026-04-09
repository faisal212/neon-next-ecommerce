"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";
import { StatusBadge } from "../../../_components/status-badge";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalPkr: string;
  createdAt: string;
  guestPhone: string | null;
  userId: string | null;
}

const STATUSES = [
  "all",
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

const columns: Column<Order>[] = [
  {
    key: "orderNumber",
    label: "Order #",
    sortable: true,
    searchable: true,
    getValue: (row) => row.orderNumber,
    render: (row) => (
      <span className="font-mono text-[12px] font-medium text-foreground">
        {row.orderNumber}
      </span>
    ),
  },
  {
    key: "date",
    label: "Date",
    sortable: true,
    getValue: (row) => new Date(row.createdAt).getTime(),
    render: (row) => (
      <span className="text-[12px] text-zinc-400">
        {new Date(row.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    key: "total",
    label: "Total",
    sortable: true,
    getValue: (row) => Number(row.totalPkr),
    render: (row) => (
      <span className="font-mono text-[12px] text-zinc-400">
        Rs. {Number(row.totalPkr).toLocaleString("en-PK")}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "payment",
    label: "Payment",
    render: () => (
      <span className="text-[12px] text-zinc-500">COD</span>
    ),
  },
];

export function OrdersClient({
  orders,
  countMap,
  totalAll,
}: {
  orders: Order[];
  countMap: Record<string, number>;
  totalAll: number;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <>
      {/* Status tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => {
          const count = s === "all" ? totalAll : countMap[s] || 0;
          const isActive = activeTab === s;
          return (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 shadow-sm"
                  : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              <span
                className={`rounded px-1 py-px text-[10px] ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search by order number..."
        emptyMessage="No orders found"
        onRowClick={(row) => router.push(`/admin/orders/${row.id}`)}
      />
    </>
  );
}
