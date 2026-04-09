"use client";

interface FilterTabsProps {
  tabs: { label: string; value: string; count?: number }[];
  activeTab: string;
  onChange: (value: string) => void;
}

export function FilterTabs({ tabs, activeTab, onChange }: FilterTabsProps) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
            activeTab === tab.value
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:border-zinc-600 hover:text-foreground"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`text-[11px] ${
                activeTab === tab.value
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground/60"
              }`}
            >
              ({tab.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
