"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "../../../../_components/data-table";
import { StatusBadge } from "../../../../_components/status-badge";
import { Plus } from "lucide-react";

interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  redirectType: number;
  hitCount: number;
  isActive: boolean;
  createdAt: string;
}

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

export function RedirectsClient({ redirects }: { redirects: Redirect[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [redirectType, setRedirectType] = useState(301);

  async function handleCreate() {
    if (!fromPath.trim() || !toPath.trim()) return;
    setSaving(true);

    const res = await fetch("/api/v1/admin/seo/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromPath: fromPath.trim(),
        toPath: toPath.trim(),
        redirectType,
      }),
    });

    if (res.ok) {
      setOpen(false);
      setFromPath("");
      setToPath("");
      setRedirectType(301);
      router.refresh();
    }
    setSaving(false);
  }

  const columns: Column<Redirect>[] = [
    {
      key: "fromPath",
      label: "From Path",
      searchable: true,
      getValue: (r) => r.fromPath,
      render: (r) => (
        <span className="font-mono text-[12px] font-medium text-foreground">
          {r.fromPath}
        </span>
      ),
    },
    {
      key: "toPath",
      label: "To Path",
      searchable: true,
      getValue: (r) => r.toPath,
      render: (r) => (
        <span className="font-mono text-[12px] text-emerald-400">
          {r.toPath}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      getValue: (r) => r.redirectType,
      render: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            r.redirectType === 301
              ? "bg-blue-500/10 text-blue-400"
              : "bg-amber-500/10 text-amber-400"
          }`}
        >
          {r.redirectType}
        </span>
      ),
    },
    {
      key: "hitCount",
      label: "Hits",
      sortable: true,
      getValue: (r) => r.hitCount,
      render: (r) => (
        <span className="font-mono text-[12px] text-muted-foreground">
          {r.hitCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "active",
      label: "Status",
      render: (r) => (
        <StatusBadge status={r.isActive ? "active" : "inactive"} />
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Redirect
        </button>
      </div>

      <DataTable
        data={redirects}
        columns={columns}
        searchPlaceholder="Search by path..."
        emptyMessage="No redirects configured"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Redirect</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                From Path
              </label>
              <input
                type="text"
                value={fromPath}
                onChange={(e) => setFromPath(e.target.value)}
                placeholder="/old-page"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                To Path
              </label>
              <input
                type="text"
                value={toPath}
                onChange={(e) => setToPath(e.target.value)}
                placeholder="/new-page"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Redirect Type
              </label>
              <select
                value={redirectType}
                onChange={(e) => setRedirectType(Number(e.target.value))}
                className={inputClass}
              >
                <option value={301}>301 — Permanent</option>
                <option value={302}>302 — Temporary</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !fromPath.trim() || !toPath.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
