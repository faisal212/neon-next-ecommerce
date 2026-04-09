"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const roles = [
  { value: "super_admin", label: "Super Admin" },
  { value: "manager", label: "Manager" },
  { value: "support", label: "Support" },
  { value: "warehouse", label: "Warehouse" },
] as const;

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

export function AdminUserEdit({
  adminId,
  initialRole,
  initialIsActive,
}: {
  adminId: string;
  initialRole: string;
  initialIsActive: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState(initialRole);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const hasChanges = role !== initialRole || isActive !== initialIsActive;

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/v1/admin/admin-users/${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, isActive }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update admin user");
      }

      setMessage({ type: "success", text: "Admin user updated successfully" });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Role select */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={inputClass}
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active toggle */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Account Status
        </label>
        <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5">
          <span className="text-[13px]">
            {isActive ? "Active" : "Inactive"}
          </span>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
            style={{
              backgroundColor: isActive
                ? "rgb(16 185 129 / 0.6)"
                : "rgb(113 113 122 / 0.4)",
            }}
            aria-label={isActive ? "Deactivate account" : "Activate account"}
          >
            <span
              className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
              style={{
                transform: isActive ? "translateX(20px)" : "translateX(0px)",
              }}
            />
          </button>
        </div>
      </div>

      {/* Feedback message */}
      {message && (
        <div
          className={`rounded-md px-3 py-2 text-[12px] font-medium ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !hasChanges}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
