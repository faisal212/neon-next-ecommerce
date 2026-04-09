"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CustomerActions({
  userId,
  isActive: initialActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(initialActive);
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    setSaving(true);
    const newStatus = !isActive;

    const res = await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: newStatus }),
    });

    if (res.ok) {
      setIsActive(newStatus);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[13px] font-medium text-foreground">
          Account Status
        </div>
        <div className="text-[11px] text-muted-foreground">
          {isActive
            ? "Customer can log in and place orders"
            : "Customer is blocked from placing orders"}
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={saving}
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50"
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
  );
}
