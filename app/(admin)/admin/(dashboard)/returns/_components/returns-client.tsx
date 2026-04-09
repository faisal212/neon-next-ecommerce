"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";
import { StatusBadge } from "../../../_components/status-badge";

interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
  orderNumber: string | null;
}

const STATUSES = ["all", "pending", "approved", "rejected", "completed"];

const columns: Column<ReturnRequest>[] = [
  {
    key: "id",
    label: "ID",
    sortable: true,
    searchable: true,
    getValue: (row) => row.id,
    render: (row) => (
      <span className="font-mono text-[12px] font-medium text-foreground">
        {row.id.slice(0, 8)}...
      </span>
    ),
  },
  {
    key: "orderNumber",
    label: "Order #",
    sortable: true,
    searchable: true,
    getValue: (row) => row.orderNumber || "",
    render: (row) => (
      <span className="font-mono text-[12px] text-zinc-400">
        {row.orderNumber || "—"}
      </span>
    ),
  },
  {
    key: "customer",
    label: "Customer",
    sortable: true,
    searchable: true,
    getValue: (row) => row.customerName || row.customerEmail || "",
    render: (row) => (
      <span className="text-[13px] text-foreground">
        {row.customerName || row.customerEmail || "Unknown"}
      </span>
    ),
  },
  {
    key: "reason",
    label: "Reason",
    sortable: true,
    getValue: (row) => row.reason,
    render: (row) => (
      <span className="text-[13px] capitalize text-zinc-400">{row.reason}</span>
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
];

export function ReturnsClient({
  returns,
  countMap,
  totalAll,
}: {
  returns: ReturnRequest[];
  countMap: Record<string, number>;
  totalAll: number;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? returns
      : returns.filter((r) => r.status === activeTab);

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
        searchPlaceholder="Search by ID, order number, or customer..."
        emptyMessage="No return requests found"
        onRowClick={(row) => router.push(`/admin/returns/${row.id}`)}
      />
    </>
  );
}
