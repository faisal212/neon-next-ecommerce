"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CouponData {
  id?: string;
  code: string;
  discountType: string;
  discountValue: string;
  minOrderPkr: string;
  maxDiscountPkr: string;
  maxUses: number | null;
  expiresAt: string;
  isActive: boolean;
}

interface CouponFormProps {
  initialData?: CouponData;
}

export function CouponForm({ initialData }: CouponFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState<CouponData>(
    initialData || {
      code: "",
      discountType: "flat_pkr",
      discountValue: "",
      minOrderPkr: "0",
      maxDiscountPkr: "",
      maxUses: null,
      expiresAt: "",
      isActive: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof CouponData>(key: K, value: CouponData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEditing
      ? `/api/v1/admin/coupons/${initialData!.id}`
      : "/api/v1/admin/coupons";

    try {
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          discountType: form.discountType,
          discountValue: form.discountValue,
          minOrderPkr: form.minOrderPkr || "0",
          maxDiscountPkr: form.maxDiscountPkr || undefined,
          maxUses: form.maxUses || undefined,
          expiresAt: form.expiresAt || undefined,
          isActive: form.isActive,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to save coupon");
        setSaving(false);
        return;
      }

      router.push("/admin/coupons");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Coupon Details */}
      <div className="mb-5 rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Coupon Details</h3>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Code
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => updateField("code", e.target.value.toUpperCase())}
              placeholder="e.g. SAVE20"
              required
              className={`${inputClass} font-mono uppercase tracking-wide`}
            />
            <p className="mt-1 text-[11px] text-muted-foreground/60">
              Will be stored in uppercase
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Discount Type
            </label>
            <select
              value={form.discountType}
              onChange={(e) => updateField("discountType", e.target.value)}
              className={`${inputClass} appearance-none pr-8`}
            >
              <option value="flat_pkr">Flat PKR</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Discount Value
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                {form.discountType === "flat_pkr" ? "Rs." : "%"}
              </span>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => updateField("discountValue", e.target.value)}
                placeholder="0"
                required
                min={0}
                step="0.01"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Min Order Amount (PKR)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                Rs.
              </span>
              <input
                type="number"
                value={form.minOrderPkr}
                onChange={(e) => updateField("minOrderPkr", e.target.value)}
                placeholder="0"
                min={0}
                step="0.01"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Max Discount (PKR)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                Rs.
              </span>
              <input
                type="number"
                value={form.maxDiscountPkr}
                onChange={(e) => updateField("maxDiscountPkr", e.target.value)}
                placeholder="No limit"
                min={0}
                step="0.01"
                className={`${inputClass} pl-9`}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground/60">
              Only relevant for percentage discounts
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Max Uses
            </label>
            <input
              type="number"
              value={form.maxUses ?? ""}
              onChange={(e) =>
                updateField("maxUses", e.target.value ? Number(e.target.value) : null)
              }
              placeholder="Unlimited"
              min={1}
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-muted-foreground/60">
              Leave empty for unlimited uses
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Expires At
          </label>
          <input
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => updateField("expiresAt", e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
          <p className="mt-1 text-[11px] text-muted-foreground/60">
            Leave empty for no expiry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Switch
            checked={form.isActive}
            onCheckedChange={(checked) => updateField("isActive", checked)}
          />
          <Label className="text-[13px]">Active</Label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditing ? "Update Coupon" : "Create Coupon"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/coupons")}
          className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
