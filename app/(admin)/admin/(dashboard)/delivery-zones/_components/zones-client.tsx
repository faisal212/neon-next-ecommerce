"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "../../../_components/data-table";
import { PAKISTAN_PROVINCES } from "@/lib/validators/user.validators";

interface ZoneRow {
  id: string;
  city: string | null;
  province: string;
  shippingChargePkr: string;
  estimatedDays: number;
  isCodAvailable: boolean;
  isActive: boolean;
}

interface ZoneFormState {
  city: string;
  province: string;
  shippingChargePkr: string;
  estimatedDays: string;
  isCodAvailable: boolean;
  isActive: boolean;
}

const emptyForm: ZoneFormState = {
  city: "",
  province: "",
  shippingChargePkr: "",
  estimatedDays: "",
  isCodAvailable: true,
  isActive: true,
};

export function ZonesClient({ data }: { data: ZoneRow[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ZoneFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(zone: ZoneRow) {
    setEditingId(zone.id);
    setForm({
      city: zone.city || "",
      province: zone.province,
      shippingChargePkr: zone.shippingChargePkr,
      estimatedDays: String(zone.estimatedDays),
      isCodAvailable: zone.isCodAvailable,
      isActive: zone.isActive,
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editingId
      ? `/api/v1/admin/delivery-zones/${editingId}`
      : "/api/v1/admin/delivery-zones";

    try {
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: form.city.trim() || null,
          province: form.province,
          shippingChargePkr: form.shippingChargePkr,
          estimatedDays: parseInt(form.estimatedDays, 10),
          isCodAvailable: form.isCodAvailable,
          isActive: form.isActive,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to save zone");
        setSaving(false);
        return;
      }

      setDialogOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this delivery zone?")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/v1/admin/delivery-zones/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error?.message || "Failed to delete zone");
        setDeletingId(null);
        return;
      }

      router.refresh();
    } catch {
      alert("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: Column<ZoneRow>[] = [
    {
      key: "city",
      label: "City",
      sortable: true,
      searchable: true,
      getValue: (row) => row.city || 'All cities',
      render: (row) => <span className="font-medium text-foreground">{row.city || <span className="italic text-muted-foreground">Province-wide</span>}</span>,
    },
    {
      key: "province",
      label: "Province",
      sortable: true,
      searchable: true,
      getValue: (row) => row.province,
      render: (row) => row.province,
    },
    {
      key: "shippingChargePkr",
      label: "Shipping (PKR)",
      sortable: true,
      getValue: (row) => Number(row.shippingChargePkr),
      render: (row) => `Rs. ${Number(row.shippingChargePkr).toLocaleString("en-PK")}`,
    },
    {
      key: "estimatedDays",
      label: "Est. Days",
      sortable: true,
      getValue: (row) => row.estimatedDays,
      render: (row) => `${row.estimatedDays} day${row.estimatedDays !== 1 ? "s" : ""}`,
    },
    {
      key: "isCodAvailable",
      label: "COD",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            row.isCodAvailable
              ? "bg-emerald-500/15 text-emerald-500"
              : "bg-zinc-500/15 text-zinc-400"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {row.isCodAvailable ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Active",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            row.isActive
              ? "bg-emerald-500/15 text-emerald-500"
              : "bg-zinc-500/15 text-zinc-400"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {row.isActive ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-[80px]",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            disabled={deletingId === row.id}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Zone
        </button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        searchPlaceholder="Search zones by city or province..."
        emptyMessage="No delivery zones yet"
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Zone" : "Add Delivery Zone"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Leave empty for province-wide rate"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Province
                </label>
                <select
                  value={form.province}
                  onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                  required
                  className={`${inputClass} appearance-none pr-8`}
                >
                  <option value="">Select province</option>
                  {PAKISTAN_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Shipping Charge (PKR)
                  </label>
                  <input
                    type="number"
                    value={form.shippingChargePkr}
                    onChange={(e) => setForm((f) => ({ ...f, shippingChargePkr: e.target.value }))}
                    placeholder="e.g. 250"
                    required
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Estimated Days
                  </label>
                  <input
                    type="number"
                    value={form.estimatedDays}
                    onChange={(e) => setForm((f) => ({ ...f, estimatedDays: e.target.value }))}
                    placeholder="e.g. 3"
                    required
                    min="1"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <div className="flex items-center gap-2.5">
                  <Switch
                    checked={form.isCodAvailable}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({ ...f, isCodAvailable: checked }))
                    }
                  />
                  <Label className="text-[13px]">COD Available</Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({ ...f, isActive: checked }))
                    }
                  />
                  <Label className="text-[13px]">Active</Label>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update Zone" : "Add Zone"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
