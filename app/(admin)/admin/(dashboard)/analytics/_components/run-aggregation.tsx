"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function RunAggregationButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    await fetch("/api/v1/admin/analytics/aggregate", {
      method: "POST",
    });
    setRunning(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleRun}
      disabled={running}
      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
      {running ? "Running..." : "Run Daily Aggregation"}
    </button>
  );
}
