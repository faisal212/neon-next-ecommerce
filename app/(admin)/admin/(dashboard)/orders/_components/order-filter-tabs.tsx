"use client";

import { useRouter } from "next/navigation";

interface Tab {
  label: string;
  value: string;
  count: number;
}

export function OrderFilterTabs({
  tabs,
  activeTab,
}: {
  tabs: Tab[];
  activeTab: string;
}) {
  const router = useRouter();

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => router.push(`/admin/orders?status=${tab.value}`)}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
            activeTab === tab.value
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:border-zinc-600 hover:text-foreground"
          }`}
        >
          {tab.label}
          <span
            className={`text-[11px] ${
              activeTab === tab.value
                ? "text-primary-foreground/70"
                : "text-muted-foreground/60"
            }`}
          >
            ({tab.count})
          </span>
        </button>
      ))}
    </div>
  );
}
