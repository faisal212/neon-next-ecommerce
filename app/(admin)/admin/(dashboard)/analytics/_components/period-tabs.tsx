"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PERIODS, type Period } from "@/lib/utils/period";

export function PeriodTabs({ active }: { active: Period }) {
  const router = useRouter();
  const search = useSearchParams();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => {
            const params = new URLSearchParams(search.toString());
            params.set("period", p.value);
            router.push(`?${params.toString()}`);
          }}
          className={`rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
            active === p.value
              ? "bg-primary/10 text-primary"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
