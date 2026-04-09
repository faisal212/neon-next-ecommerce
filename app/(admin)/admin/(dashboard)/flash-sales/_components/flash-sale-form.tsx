"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FlashSaleData {
  id?: string;
  name: string;
  discountType: string;
  discountValue: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

interface FlashSaleFormProps {
  initialData?: FlashSaleData;
}

export function FlashSaleForm({ initialData }: FlashSaleFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [name, setName] = useState(initialData?.name || "");
  const [discountType, setDiscountType] = useState(initialData?.discountType || "percentage");
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue || "");
  const [startsAt, setStartsAt] = useState(initialData?.startsAt || "");
  const [endsAt, setEndsAt] = useState(initialData?.endsAt || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEditing
      ? `/api/v1/admin/flash-sales/${initialData!.id}`
      : "/api/v1/admin/flash-sales";

    try {
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          discountType,
          discountValue,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
          isActive,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to save flash sale");
        setSaving(false);
        return;
      }

      router.push("/admin/flash-sales");
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

      <div className="mb-5 rounded-lg border border-border bg-card p-5">
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Eid Collection Sale"
            required
            className={inputClass}
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Discount Type
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className={`${inputClass} appearance-none pr-8`}
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat PKR</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Discount Value
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="e.g. 20"
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Start Date/Time
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              End Date/Time
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label className="text-[13px]">Active</Label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditing ? "Update Flash Sale" : "Create Flash Sale"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/flash-sales")}
          className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
