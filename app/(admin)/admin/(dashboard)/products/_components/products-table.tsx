"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";
import { StatusBadge } from "../../../_components/status-badge";
import { Image, Layers, Trash, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  nameEn: string;
  categoryId: string;
  categoryName: string;
  basePricePkr: string;
  isActive: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  variantCount: number;
  imageCount: number;
  primaryImage: string | null;
}

interface Category {
  id: string;
  nameEn: string;
}

interface ProductsTableProps {
  data: Product[];
  categories: Category[];
}

type StatusFilter = "all" | "draft" | "published" | "active" | "inactive" | "featured";

export function ProductsTable({ data, categories }: ProductsTableProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<Product | null>(null);
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);

  // Filter data
  const filtered = useMemo(() => {
    let result = data;

    if (statusFilter === "draft") result = result.filter((p) => !p.isPublished);
    else if (statusFilter === "published") result = result.filter((p) => p.isPublished);
    else if (statusFilter === "active") result = result.filter((p) => p.isPublished && p.isActive);
    else if (statusFilter === "inactive") result = result.filter((p) => p.isPublished && !p.isActive);
    else if (statusFilter === "featured") result = result.filter((p) => p.isFeatured);

    if (categoryFilter) result = result.filter((p) => p.categoryId === categoryFilter);

    return result;
  }, [data, statusFilter, categoryFilter]);

  // Counts
  const counts = useMemo(() => ({
    all: data.length,
    draft: data.filter((p) => !p.isPublished).length,
    published: data.filter((p) => p.isPublished).length,
    active: data.filter((p) => p.isPublished && p.isActive).length,
    inactive: data.filter((p) => p.isPublished && !p.isActive).length,
    featured: data.filter((p) => p.isFeatured).length,
  }), [data]);

  async function handleDelete(e: React.MouseEvent, product: Product) {
    e.stopPropagation();
    if (!confirm(`Deactivate "${product.nameEn}"? It will be hidden from the store.`)) return;

    setDeletingId(product.id);
    try {
      const res = await fetch(`/api/v1/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      if (res.ok) router.refresh();
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  }

  function openPurgeDialog(e: React.MouseEvent, product: Product) {
    e.stopPropagation();
    setPurgeError(null);
    setPurgeTarget(product);
  }

  async function handlePermanentDelete() {
    if (!purgeTarget || purging) return;
    setPurging(true);
    setPurgeError(null);
    try {
      const res = await fetch(`/api/v1/admin/products/${purgeTarget.id}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        setPurgeTarget(null);
        router.refresh();
        return;
      }
      // Try to surface the server's error message (handleApiError shape).
      let message = "Failed to delete product.";
      try {
        const json = (await res.json()) as { error?: { message?: string } };
        if (json?.error?.message) message = json.error.message;
      } catch {
        // ignore parse errors
      }
      setPurgeError(message);
    } catch {
      setPurgeError("Network error. Please try again.");
    } finally {
      setPurging(false);
    }
  }

  const columns: Column<Product>[] = [
    {
      key: "image",
      label: "",
      className: "w-12",
      render: (row) =>
        row.primaryImage ? (
          <img
            src={row.primaryImage}
            alt={row.nameEn}
            className="h-9 w-9 rounded-md border border-border object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-zinc-800/50">
            <Image className="h-4 w-4 text-zinc-600" />
          </div>
        ),
    },
    {
      key: "nameEn",
      label: "Product",
      sortable: true,
      searchable: true,
      getValue: (row) => row.nameEn,
      render: (row) => (
        <div>
          <span className="font-medium text-foreground">{row.nameEn}</span>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
            {row.variantCount > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <Layers className="h-3 w-3" />
                {row.variantCount} variant{row.variantCount !== 1 ? "s" : ""}
              </span>
            )}
            {row.imageCount > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <Image className="h-3 w-3" />
                {row.imageCount}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      searchable: true,
      getValue: (row) => row.categoryName,
      render: (row) => <span className="text-zinc-400">{row.categoryName}</span>,
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      getValue: (row) => Number(row.basePricePkr),
      render: (row) => (
        <span className="font-mono text-[12px] text-zinc-400">
          Rs. {Number(row.basePricePkr).toLocaleString("en-PK")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      getValue: (row) =>
        !row.isPublished ? "draft" : row.isActive ? "active" : "inactive",
      render: (row) => (
        <StatusBadge
          status={!row.isPublished ? "draft" : row.isActive ? "active" : "inactive"}
        />
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (row) =>
        row.isFeatured ? (
          <span className="inline-flex rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            Featured
          </span>
        ) : null,
    },
    {
      key: "date",
      label: "Created",
      sortable: true,
      getValue: (row) => new Date(row.createdAt).getTime(),
      render: (row) => (
        <span className="text-[12px] text-zinc-500">
          {new Date(row.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-20",
      render: (row) => {
        const isDraft = !row.isPublished;
        const deactivateDisabled = deletingId === row.id || isDraft || !row.isActive;
        const deactivateTitle = isDraft
          ? "Drafts can't be deactivated"
          : row.isActive
            ? "Deactivate product"
            : "Already inactive";
        return (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => handleDelete(e, row)}
              disabled={deactivateDisabled}
              title={deactivateTitle}
              className="rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => openPurgeDialog(e, row)}
              title="Delete permanently"
              className="rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "draft", label: "Drafts", count: counts.draft },
    { key: "published", label: "Published", count: counts.published },
    { key: "active", label: "Active", count: counts.active },
    { key: "inactive", label: "Inactive", count: counts.inactive },
    { key: "featured", label: "Featured", count: counts.featured },
  ];

  return (
    <>
    <div>
      {/* Filter Bar */}
      <div className="mb-4 flex items-center gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-primary/10 text-primary"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1 text-[10px] ${
                  statusFilter === tab.key
                    ? "text-primary/70"
                    : "text-zinc-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-medium text-zinc-400 outline-none transition-colors focus:border-primary/40"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nameEn}
            </option>
          ))}
        </select>

        {/* Result count */}
        <span className="ml-auto text-[12px] text-zinc-500">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        pageSize={15}
        searchPlaceholder="Search products by name or category..."
        emptyMessage="No products match your filters"
        onRowClick={(row) => router.push(`/admin/products/${row.id}/edit`)}
      />
    </div>

    <Dialog
      open={purgeTarget !== null}
      onOpenChange={(open) => {
        if (!open && !purging) {
          setPurgeTarget(null);
          setPurgeError(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permanently delete product?</DialogTitle>
          <DialogDescription>
            {purgeTarget?.nameEn}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This cannot be undone. All variants, images, tags, reviews, and
          analytics for this product will be deleted.
        </p>
        {purgeError && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
            {purgeError}
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={purging}
            onClick={() => {
              setPurgeTarget(null);
              setPurgeError(null);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={purging}
            onClick={handlePermanentDelete}
            className="bg-red-500 text-white hover:bg-red-500/90 focus-visible:ring-red-500/40"
          >
            {purging ? "Deleting..." : "Delete forever"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
