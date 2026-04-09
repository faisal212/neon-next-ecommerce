"use client";

import { DataTable, type Column } from "../../../_components/data-table";

interface Referral {
  id: string;
  referrerName: string;
  referredName: string;
  referralCode: string;
  rewardPoints: number;
  rewardGiven: boolean;
  createdAt: string;
}

export function ReferralsClient({
  referrals,
}: {
  referrals: Referral[];
}) {
  const columns: Column<Referral>[] = [
    {
      key: "referrer",
      label: "Referrer",
      searchable: true,
      getValue: (r) => r.referrerName,
      render: (r) => (
        <span className="font-medium text-foreground">{r.referrerName}</span>
      ),
    },
    {
      key: "referred",
      label: "Referred User",
      searchable: true,
      getValue: (r) => r.referredName,
      render: (r) => (
        <span className="text-muted-foreground">{r.referredName}</span>
      ),
    },
    {
      key: "code",
      label: "Referral Code",
      searchable: true,
      getValue: (r) => r.referralCode,
      render: (r) => (
        <span className="font-mono text-[12px] font-medium text-foreground">
          {r.referralCode}
        </span>
      ),
    },
    {
      key: "points",
      label: "Reward Points",
      sortable: true,
      getValue: (r) => r.rewardPoints,
      render: (r) => (
        <span className="font-semibold text-emerald-400">
          {r.rewardPoints.toLocaleString()}
        </span>
      ),
    },
    {
      key: "rewardGiven",
      label: "Reward Given",
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            r.rewardGiven
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-zinc-500/10 text-zinc-400"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                r.rewardGiven ? "bg-emerald-400" : "bg-zinc-500"
              }`}
            />
          </span>
          {r.rewardGiven ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      getValue: (r) => new Date(r.createdAt).getTime(),
      render: (r) => (
        <span className="text-muted-foreground">
          {new Date(r.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={referrals}
      columns={columns}
      searchPlaceholder="Search by name or code..."
      emptyMessage="No referrals found"
    />
  );
}
