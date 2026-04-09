"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export function StatusUpdateForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === currentStatus) return;
    setSaving(true);

    const res = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes: notes || undefined }),
    });

    if (res.ok) {
      router.refresh();
    }
    setSaving(false);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Update Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${inputClass} appearance-none pr-8`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Notes (optional)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Dispatched via TCS"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={saving || status === currentStatus}
        className="w-full rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Updating..." : "Update Status"}
      </button>
    </form>
  );
}

export function CourierAssignForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/v1/admin/orders/${orderId}/courier`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courierName,
        trackingNumber: trackingNumber || undefined,
        riderName: riderName || undefined,
        riderPhone: riderPhone || undefined,
      }),
    });

    if (res.ok) {
      router.refresh();
    }
    setSaving(false);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Courier Name
        </label>
        <input
          type="text"
          value={courierName}
          onChange={(e) => setCourierName(e.target.value)}
          placeholder="e.g. TCS"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Tracking Number
        </label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g. TCS-2026031500123"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Rider Name
          </label>
          <input
            type="text"
            value={riderName}
            onChange={(e) => setRiderName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Rider Phone
          </label>
          <input
            type="text"
            value={riderPhone}
            onChange={(e) => setRiderPhone(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving || !courierName}
        className="w-full rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Assigning..." : "Assign Courier"}
      </button>
    </form>
  );
}

export function CodCollectionForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/v1/admin/orders/${orderId}/cod`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountCollectedPkr: amount }),
    });

    if (res.ok) {
      router.refresh();
    }
    setSaving(false);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Amount Collected (PKR)
        </label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 7500"
          required
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={saving || !amount}
        className="w-full rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Recording..." : "Record COD Payment"}
      </button>
    </form>
  );
}
