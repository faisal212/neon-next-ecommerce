"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";
import { AlertTriangle, PackageCheck, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface InventoryItem {
  id: string;
  variantId: string;
  productName: string;
  sku: string;
  variant: string;
  quantityOnHand: number;
  quantityReserved: number;
  available: number;
  lowStockThreshold: number;
  isLow: boolean;
}

type FilterMode = "all" | "low" | "ok";

export function InventoryTable({ data }: { data: InventoryItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editOnHand, setEditOnHand] = useState(0);
  const [editThreshold, setEditThreshold] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openEdit(item: InventoryItem) {
    setEditItem(item);
    setEditOnHand(item.quantityOnHand);
    setEditThreshold(item.lowStockThreshold);
    setError("");
    setEditOpen(true);
  }

  async function handleSave() {
    if (!editItem) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(
        `/api/v1/admin/products/${editItem.variantId}/inventory`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantityOnHand: editOnHand,
            lowStockThreshold: editThreshold,
          }),
        },
      );

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to update inventory");
        setSaving(false);
        return;
      }

      setEditOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

  const columns: Column<InventoryItem>[] = [
    {
      key: "product",
      label: "Product",
      sortable: true,
      searchable: true,
      getValue: (row) => row.productName,
      render: (row) => (
        <span className="font-medium text-foreground">{row.productName}</span>
      ),
    },
    {
      key: "sku",
      label: "SKU",
      sortable: true,
      searchable: true,
      getValue: (row) => row.sku,
      render: (row) => (
        <span className="font-mono text-[11px] text-zinc-500">{row.sku}</span>
      ),
    },
    {
      key: "variant",
      label: "Variant",
      searchable: true,
      getValue: (row) => row.variant,
      render: (row) => (
        <span className="text-zinc-400">{row.variant}</span>
      ),
    },
    {
      key: "onHand",
      label: "On Hand",
      sortable: true,
      headerClassName: "text-right",
      className: "text-right",
      getValue: (row) => row.quantityOnHand,
      render: (row) => (
        <span className="font-mono text-[12px] text-zinc-400">
          {row.quantityOnHand}
        </span>
      ),
    },
    {
      key: "reserved",
      label: "Reserved",
      sortable: true,
      headerClassName: "text-right",
      className: "text-right",
      getValue: (row) => row.quantityReserved,
      render: (row) => (
        <span className="font-mono text-[12px] text-zinc-500">
          {row.quantityReserved}
        </span>
      ),
    },
    {
      key: "available",
      label: "Available",
      sortable: true,
      headerClassName: "text-right",
      className: "text-right",
      getValue: (row) => row.available,
      render: (row) => (
        <span
          className={`font-mono text-[12px] font-semibold ${
            row.isLow ? "text-red-400" : "text-emerald-400"
          }`}
        >
          {row.available}
        </span>
      ),
    },
    {
      key: "threshold",
      label: "Threshold",
      sortable: true,
      headerClassName: "text-right",
      className: "text-right",
      getValue: (row) => row.lowStockThreshold,
      render: (row) => (
        <span className="font-mono text-[12px] text-zinc-600">
          {row.lowStockThreshold}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      getValue: (row) => (row.isLow ? 0 : 1),
      render: (row) =>
        row.isLow ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
            </span>
            Low
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            OK
          </span>
        ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openEdit(row);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      ),
    },
  ];

  const filtered =
    filter === "all"
      ? data
      : filter === "low"
        ? data.filter((i) => i.isLow)
        : data.filter((i) => !i.isLow);

  const lowCount = data.filter((i) => i.isLow).length;
  const okCount = data.length - lowCount;

  return (
    <>
      {/* Filter tabs */}
      <div className="mb-5 flex items-center gap-1.5">
        {(
          [
            { key: "all", label: "All", count: data.length, icon: null },
            { key: "low", label: "Low Stock", count: lowCount, icon: AlertTriangle },
            { key: "ok", label: "In Stock", count: okCount, icon: PackageCheck },
          ] as const
        ).map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all duration-200 ${
                isActive
                  ? tab.key === "low"
                    ? "bg-red-500/15 text-red-400 shadow-sm"
                    : "bg-emerald-500/15 text-emerald-400 shadow-sm"
                  : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
              }`}
            >
              {tab.icon && <tab.icon className="h-3 w-3" />}
              {tab.label}
              <span
                className={`rounded px-1 py-px text-[10px] ${
                  isActive
                    ? tab.key === "low"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-emerald-500/20 text-emerald-400"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        pageSize={15}
        searchPlaceholder="Search by product, SKU, or variant..."
        emptyMessage="No inventory records"
      />

      {/* Edit Inventory Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Inventory</DialogTitle>
          </DialogHeader>

          {editItem && (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-background/50 px-3 py-2">
                <p className="text-[13px] font-medium text-foreground">
                  {editItem.productName}
                </p>
                <p className="text-[11px] text-zinc-500">
                  SKU: {editItem.sku} &middot; {editItem.variant}
                </p>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Quantity On Hand
                </label>
                <input
                  type="number"
                  min={0}
                  value={editOnHand}
                  onChange={(e) => setEditOnHand(parseInt(e.target.value, 10) || 0)}
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] text-zinc-600">
                  Reserved: {editItem.quantityReserved} &middot; Available after
                  save:{" "}
                  <span
                    className={
                      editOnHand - editItem.quantityReserved <= editThreshold
                        ? "text-red-400"
                        : "text-emerald-400"
                    }
                  >
                    {editOnHand - editItem.quantityReserved}
                  </span>
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min={0}
                  value={editThreshold}
                  onChange={(e) =>
                    setEditThreshold(parseInt(e.target.value, 10) || 0)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose
              className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
            >
              Cancel
            </DialogClose>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
