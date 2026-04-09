"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "../../../_components/data-table";

interface PointsBalance {
  id: string;
  userId: string;
  totalEarned: number;
  totalRedeemed: number;
  balance: number;
  updatedAt: string;
  userName: string | null;
  userEmail: string | null;
}

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

export function LoyaltyClient({
  balances,
}: {
  balances: PointsBalance[];
}) {
  const router = useRouter();
  const [adjusting, setAdjusting] = useState<PointsBalance | null>(null);
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  function openAdjust(balance: PointsBalance) {
    setAdjusting(balance);
    setPoints("");
    setDescription("");
  }

  async function handleAdjust() {
    if (!adjusting || !points || !description.trim()) return;
    setSaving(true);

    const res = await fetch(`/api/v1/admin/loyalty/${adjusting.userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points: Number(points),
        description: description.trim(),
      }),
    });

    if (res.ok) {
      setAdjusting(null);
      router.refresh();
    }
    setSaving(false);
  }

  const columns: Column<PointsBalance>[] = [
    {
      key: "name",
      label: "Customer Name",
      searchable: true,
      getValue: (b) => b.userName || "",
      render: (b) => (
        <span className="font-medium text-foreground">
          {b.userName || "—"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      searchable: true,
      getValue: (b) => b.userEmail || "",
      render: (b) => (
        <span className="text-muted-foreground">{b.userEmail || "—"}</span>
      ),
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      getValue: (b) => b.balance,
      render: (b) => (
        <span className="font-semibold text-emerald-400">
          {b.balance.toLocaleString()}
        </span>
      ),
    },
    {
      key: "earned",
      label: "Total Earned",
      sortable: true,
      getValue: (b) => b.totalEarned,
      render: (b) => (
        <span className="text-muted-foreground">
          {b.totalEarned.toLocaleString()}
        </span>
      ),
    },
    {
      key: "redeemed",
      label: "Total Redeemed",
      sortable: true,
      getValue: (b) => b.totalRedeemed,
      render: (b) => (
        <span className="text-muted-foreground">
          {b.totalRedeemed.toLocaleString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (b) => (
        <button
          onClick={() => openAdjust(b)}
          className="rounded-md border border-border bg-card px-3 py-1 text-[12px] font-medium transition-colors hover:border-zinc-600"
        >
          Adjust
        </button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={balances}
        columns={columns}
        searchPlaceholder="Search by name or email..."
        emptyMessage="No loyalty point records found"
      />

      <Dialog
        open={!!adjusting}
        onOpenChange={(open) => !open && setAdjusting(null)}
      >
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Points</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Customer
              </label>
              <input
                type="text"
                value={
                  adjusting
                    ? `${adjusting.userName || "Unknown"} (${adjusting.userEmail || "—"})`
                    : ""
                }
                disabled
                className={`${inputClass} opacity-50`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Current Balance
              </label>
              <input
                type="text"
                value={adjusting?.balance.toLocaleString() || "0"}
                disabled
                className={`${inputClass} opacity-50`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Points (positive = credit, negative = debit)
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="e.g. 100 or -50"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Reason for adjustment..."
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAdjusting(null)}
                className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={saving || !points || Number(points) === 0 || !description.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Adjusting..." : "Adjust Points"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
