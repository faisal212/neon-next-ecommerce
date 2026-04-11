"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { DataTable, type Column } from "../../../_components/data-table";
import { StatusBadge } from "../../../_components/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  function openDeleteDialog(e: React.MouseEvent, order: Order) {
    e.stopPropagation();
    setDeleteError(null);
    setDeleteTarget(order);
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/v1/admin/orders/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        setDeleteTarget(null);
        router.refresh();
        return;
      }
      let message = "Failed to delete order.";
      try {
        const json = (await res.json()) as { error?: { message?: string } };
        if (json?.error?.message) message = json.error.message;
      } catch {
        // ignore parse errors
      }
      setDeleteError(message);
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  // Columns are built inside the component so the actions cell can
  // close over `openDeleteDialog`.
  const columns = useMemo<Column<Order>[]>(
    () => [
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
      {
        key: "actions",
        label: "",
        className: "w-10",
        render: (row) => (
          <button
            type="button"
            onClick={(e) => openDeleteDialog(e, row)}
            title="Delete order permanently"
            className="rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        ),
      },
    ],
    [],
  );

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

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently delete order?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This cannot be undone. The order, its line items, status history,
            COD record, and courier assignment will be deleted. Reserved
            inventory (if any) will be released back to stock.
          </p>
          {deleteError && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
              {deleteError}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-500/90 focus-visible:ring-red-500/40"
            >
              {deleting ? "Deleting..." : "Delete forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
