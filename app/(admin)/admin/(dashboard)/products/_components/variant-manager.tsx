"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface VariantStock {
  onHand: number;
  reserved: number;
  available: number;
  threshold: number;
}

interface Variant {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  extraPricePkr: string | null;
  isActive: boolean;
  stock?: VariantStock;
}

interface VariantManagerProps {
  productId: string;
  variants: Variant[];
}

interface VariantFormData {
  sku: string;
  color: string;
  size: string;
  extraPricePkr: string;
  isActive: boolean;
}

const emptyForm: VariantFormData = {
  sku: "",
  color: "",
  size: "",
  extraPricePkr: "0",
  isActive: true,
};

export function VariantManager({ productId, variants }: VariantManagerProps) {
  const router = useRouter();

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<VariantFormData>(emptyForm);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [editForm, setEditForm] = useState<VariantFormData>(emptyForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

  // ── Create ────────────────────────────────────────────────

  async function handleAdd() {
    if (!addForm.sku.trim()) return;
    setAddSaving(true);
    setAddError("");

    try {
      const res = await fetch(`/api/v1/admin/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: addForm.sku,
          color: addForm.color || undefined,
          size: addForm.size || undefined,
          extraPricePkr: addForm.extraPricePkr || "0",
          isActive: addForm.isActive,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setAddError(json.error?.message || "Failed to create variant");
        setAddSaving(false);
        return;
      }

      setAddForm(emptyForm);
      setShowAddForm(false);
      router.refresh();
    } catch {
      setAddError("Something went wrong");
    } finally {
      setAddSaving(false);
    }
  }

  // ── Update ────────────────────────────────────────────────

  function openEdit(variant: Variant) {
    setEditingVariant(variant);
    setEditForm({
      sku: variant.sku,
      color: variant.color || "",
      size: variant.size || "",
      extraPricePkr: variant.extraPricePkr || "0",
      isActive: variant.isActive,
    });
    setEditError("");
    setEditDialogOpen(true);
  }

  async function handleUpdate() {
    if (!editingVariant) return;
    setEditSaving(true);
    setEditError("");

    try {
      const res = await fetch(
        `/api/v1/admin/products/${productId}/variants/${editingVariant.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: editForm.sku,
            color: editForm.color || undefined,
            size: editForm.size || undefined,
            extraPricePkr: editForm.extraPricePkr || "0",
            isActive: editForm.isActive,
          }),
        },
      );

      if (!res.ok) {
        const json = await res.json();
        setEditError(json.error?.message || "Failed to update variant");
        setEditSaving(false);
        return;
      }

      setEditDialogOpen(false);
      router.refresh();
    } catch {
      setEditError("Something went wrong");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────

  async function handleDelete(variantId: string) {
    setDeletingId(variantId);

    try {
      const res = await fetch(
        `/api/v1/admin/products/${productId}/variants/${variantId}`,
        { method: "DELETE" },
      );

      if (!res.ok && res.status !== 204) {
        const json = await res.json();
        // Show error inline via edit error for simplicity
        setEditError(json.error?.message || "Failed to delete variant");
        return;
      }

      router.refresh();
    } catch {
      // silently fail -- page will not refresh so user can retry
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mb-5 rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Variants</h3>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
          >
            <Plus className="h-3 w-3" />
            Add Variant
          </button>
        )}
      </div>

      {/* Variants table */}
      {variants.length > 0 && (
        <div className="mb-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  SKU
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Color
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Size
                </th>
                <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Extra Price
                </th>
                <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Stock
                </th>
                <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Active
                </th>
                <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-border/50 last:border-b-0 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-2">
                    <span className="font-mono text-[12px] text-zinc-400">
                      {v.sku}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[13px] text-zinc-400">
                    {v.color || "—"}
                  </td>
                  <td className="px-3 py-2 text-[13px] text-zinc-400">
                    {v.size || "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-[12px] text-zinc-400">
                    {v.extraPricePkr && v.extraPricePkr !== "0"
                      ? `+Rs. ${v.extraPricePkr}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {v.stock ? (
                      <div className="inline-flex flex-col items-end gap-0.5">
                        <span
                          className={`font-mono text-[12px] font-semibold ${
                            v.stock.available <= v.stock.threshold
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {v.stock.available}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          {v.stock.onHand} on hand
                          {v.stock.reserved > 0 && ` · ${v.stock.reserved} reserved`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {v.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(v)}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id)}
                        disabled={deletingId === v.id}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-red-400/70 transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {variants.length === 0 && !showAddForm && (
        <p className="mb-4 text-[13px] text-zinc-500">
          No variants yet. Add one to manage SKUs, colors, and sizes.
        </p>
      )}

      {/* Add Variant Form */}
      {showAddForm && (
        <div className="rounded-lg border border-border bg-background/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-[13px] font-medium text-foreground">
              New Variant
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setAddForm(emptyForm);
                setAddError("");
              }}
              className="rounded p-1 text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {addError && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {addError}
            </div>
          )}

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                SKU *
              </label>
              <input
                type="text"
                value={addForm.sku}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, sku: e.target.value }))
                }
                placeholder="e.g. LAWN-BLU-M"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Color
              </label>
              <input
                type="text"
                value={addForm.color}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, color: e.target.value }))
                }
                placeholder="e.g. Blue"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Size
              </label>
              <input
                type="text"
                value={addForm.size}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, size: e.target.value }))
                }
                placeholder="e.g. Medium"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Extra Price (PKR)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                  +Rs.
                </span>
                <input
                  type="text"
                  value={addForm.extraPricePkr}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, extraPricePkr: e.target.value }))
                  }
                  placeholder="0.00"
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2.5">
            <Switch
              checked={addForm.isActive}
              onCheckedChange={(checked) =>
                setAddForm((f) => ({ ...f, isActive: checked }))
              }
            />
            <Label className="text-[13px]">Active</Label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={addSaving || !addForm.sku.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {addSaving ? "Creating..." : "Create Variant"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setAddForm(emptyForm);
                setAddError("");
              }}
              className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Variant Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
          </DialogHeader>

          {editingVariant && (
            <div className="space-y-4">
              {editError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {editError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  SKU *
                </label>
                <input
                  type="text"
                  value={editForm.sku}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, sku: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Color
                  </label>
                  <input
                    type="text"
                    value={editForm.color}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, color: e.target.value }))
                    }
                    placeholder="e.g. Blue"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Size
                  </label>
                  <input
                    type="text"
                    value={editForm.size}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, size: e.target.value }))
                    }
                    placeholder="e.g. Medium"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Extra Price (PKR)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                    +Rs.
                  </span>
                  <input
                    type="text"
                    value={editForm.extraPricePkr}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        extraPricePkr: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className={`${inputClass} pl-12`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(checked) =>
                    setEditForm((f) => ({ ...f, isActive: checked }))
                  }
                />
                <Label className="text-[13px]">Active</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600">
              Cancel
            </DialogClose>
            <button
              onClick={handleUpdate}
              disabled={editSaving || !editForm.sku.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {editSaving ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
