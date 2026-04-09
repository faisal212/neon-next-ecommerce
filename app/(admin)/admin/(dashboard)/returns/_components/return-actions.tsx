"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = ["pending", "approved", "rejected", "completed"];
const RESOLUTION_OPTIONS = ["refund", "exchange", "credit"];

export function ReturnActions({
  returnId,
  currentStatus,
  currentResolution,
}: {
  returnId: string;
  currentStatus: string;
  currentResolution: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [resolution, setResolution] = useState(currentResolution || "");
  const [saving, setSaving] = useState(false);

  const showResolution = status === "approved" || status === "completed";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/v1/admin/returns/${returnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        resolution: showResolution && resolution ? resolution : undefined,
      }),
    });

    if (res.ok) {
      router.refresh();
    }
    setSaving(false);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Status
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
      {showResolution && (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Resolution
          </label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className={`${inputClass} appearance-none pr-8`}
          >
            <option value="">Select resolution...</option>
            {RESOLUTION_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        type="submit"
        disabled={saving || status === currentStatus}
        className="w-full rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
