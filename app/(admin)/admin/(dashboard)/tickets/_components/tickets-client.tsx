"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";
import { StatusBadge } from "../../../_components/status-badge";

interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string;
  orderId: string | null;
  category: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
}

const STATUSES = [
  "all",
  "open",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
];

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  open: "Open",
  in_progress: "In Progress",
  waiting: "Waiting",
  resolved: "Resolved",
  closed: "Closed",
};

const columns: Column<Ticket>[] = [
  {
    key: "ticketNumber",
    label: "Ticket #",
    sortable: true,
    searchable: true,
    getValue: (row) => row.ticketNumber,
    render: (row) => (
      <span className="font-mono text-[12px] font-medium text-foreground">
        {row.ticketNumber}
      </span>
    ),
  },
  {
    key: "subject",
    label: "Subject",
    sortable: true,
    searchable: true,
    getValue: (row) => row.subject,
    render: (row) => (
      <span className="max-w-[240px] truncate text-[13px] text-foreground">
        {row.subject}
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
    key: "category",
    label: "Category",
    sortable: true,
    getValue: (row) => row.category,
    render: (row) => (
      <span className="text-[13px] capitalize text-zinc-400">
        {row.category}
      </span>
    ),
  },
  {
    key: "priority",
    label: "Priority",
    sortable: true,
    getValue: (row) => row.priority,
    render: (row) => <StatusBadge status={row.priority} />,
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

export function TicketsClient({
  tickets,
  countMap,
  totalAll,
}: {
  tickets: Ticket[];
  countMap: Record<string, number>;
  totalAll: number;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? tickets
      : tickets.filter((t) => t.status === activeTab);

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
              {STATUS_LABELS[s] || s}
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
        searchPlaceholder="Search by ticket number, subject, or customer..."
        emptyMessage="No support tickets found"
        onRowClick={(row) => router.push(`/admin/tickets/${row.id}`)}
      />
    </>
  );
}
