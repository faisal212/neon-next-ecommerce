import type { LucideIcon } from "lucide-react";

type ColorVariant = "emerald" | "blue" | "purple" | "cyan" | "amber" | "red";

const iconBg: Record<ColorVariant, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/15 group-hover:shadow-emerald-500/10",
  blue: "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/15 group-hover:shadow-blue-500/10",
  purple: "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/15 group-hover:shadow-purple-500/10",
  cyan: "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/15 group-hover:shadow-cyan-500/10",
  amber: "bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/15 group-hover:shadow-amber-500/10",
  red: "bg-red-500/10 text-red-400 group-hover:bg-red-500/15 group-hover:shadow-red-500/10",
};

const glowColor: Record<ColorVariant, string> = {
  emerald: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.06)]",
  blue: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.06)]",
  purple: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.06)]",
  cyan: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.06)]",
  amber: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.06)]",
  red: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.06)]",
};

interface StatCardProps {
  icon: LucideIcon;
  color: ColorVariant;
  value: string;
  label: string;
  trend?: { value: string; direction: "up" | "neutral" };
}

export function StatCard({ icon: Icon, color, value, label, trend }: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-zinc-700/80 hover:-translate-y-0.5 ${glowColor[color]}`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div
        className={`relative mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 group-hover:shadow-lg ${iconBg[color]}`}
      >
        <Icon className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div className="relative mb-1 text-2xl font-bold tracking-tight">{value}</div>
      <div className="relative mb-2 text-[12px] text-zinc-500">{label}</div>
      {trend && (
        <span
          className={`relative inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
            trend.direction === "up"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-zinc-500/10 text-zinc-500"
          }`}
        >
          {trend.direction === "up" ? "↑" : "—"} {trend.value}
        </span>
      )}
    </div>
  );
}
