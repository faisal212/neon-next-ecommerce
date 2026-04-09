const statusStyles: Record<string, { bg: string; dot: string }> = {
  pending: { bg: "bg-amber-500/10 text-amber-400", dot: "bg-amber-400" },
  confirmed: { bg: "bg-cyan-500/10 text-cyan-400", dot: "bg-cyan-400" },
  packed: { bg: "bg-purple-500/10 text-purple-400", dot: "bg-purple-400" },
  shipped: { bg: "bg-blue-500/10 text-blue-400", dot: "bg-blue-400" },
  delivered: { bg: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400" },
  cancelled: { bg: "bg-red-500/10 text-red-400", dot: "bg-red-400" },
  returned: { bg: "bg-zinc-500/10 text-zinc-400", dot: "bg-zinc-400" },
  active: { bg: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400" },
  inactive: { bg: "bg-zinc-500/10 text-zinc-400", dot: "bg-zinc-500" },
  draft: { bg: "bg-zinc-500/10 text-zinc-400", dot: "bg-zinc-500" },
  open: { bg: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400" },
  resolved: { bg: "bg-blue-500/10 text-blue-400", dot: "bg-blue-400" },
  closed: { bg: "bg-zinc-500/10 text-zinc-400", dot: "bg-zinc-500" },
  collected: { bg: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400" },
  approved: { bg: "bg-cyan-500/10 text-cyan-400", dot: "bg-cyan-400" },
  rejected: { bg: "bg-red-500/10 text-red-400", dot: "bg-red-400" },
  completed: { bg: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400" },
  in_progress: { bg: "bg-cyan-500/10 text-cyan-400", dot: "bg-cyan-400" },
  waiting: { bg: "bg-amber-500/10 text-amber-400", dot: "bg-amber-400" },
  low: { bg: "bg-zinc-500/10 text-zinc-400", dot: "bg-zinc-500" },
  medium: { bg: "bg-blue-500/10 text-blue-400", dot: "bg-blue-400" },
  high: { bg: "bg-amber-500/10 text-amber-400", dot: "bg-amber-400" },
  urgent: { bg: "bg-red-500/10 text-red-400", dot: "bg-red-400" },
};

const liveStatuses = new Set(["pending", "confirmed", "packed", "shipped", "active", "open", "in_progress", "waiting"]);

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const style = statusStyles[key] || { bg: "bg-zinc-500/10 text-zinc-400", dot: "bg-zinc-500" };
  const isLive = liveStatuses.has(key);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.bg}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {isLive && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 ${style.dot}`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      {status}
    </span>
  );
}
