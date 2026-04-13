"use client";

import { useState } from "react";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

type Scope = "products" | "all";
type Result =
  | { status: "idle" }
  | { status: "pending"; scope: Scope }
  | { status: "success"; scope: Scope; products: number; categories: number }
  | { status: "error"; error: string };

export function RevalidateButtons() {
  const [result, setResult] = useState<Result>({ status: "idle" });

  async function trigger(scope: Scope) {
    setResult({ status: "pending", scope });
    try {
      const res = await fetch("/api/v1/admin/revalidate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const json = await res.json();
      if (!res.ok) {
        setResult({
          status: "error",
          error: json?.error?.message || `HTTP ${res.status}`,
        });
        return;
      }
      setResult({
        status: "success",
        scope,
        products: json?.data?.products ?? 0,
        categories: json?.data?.categories ?? 0,
      });
    } catch (err) {
      setResult({
        status: "error",
        error: err instanceof Error ? err.message : "Request failed",
      });
    }
  }

  const isPending = result.status === "pending";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => trigger("products")}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary-fixed transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && result.scope === "products" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Invalidate Products
        </button>
        <button
          type="button"
          onClick={() => trigger("all")}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-6 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && result.scope === "all" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <AlertTriangle size={16} />
          )}
          Invalidate All
        </button>
      </div>

      {result.status === "success" && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-400">
          <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">
              {result.scope === "all"
                ? "All caches invalidated"
                : "Product caches invalidated"}
            </p>
            <p className="mt-1 text-emerald-400/80">
              {result.products} product{result.products !== 1 ? "s" : ""}
              {result.scope === "all" &&
                ` · ${result.categories} categor${result.categories !== 1 ? "ies" : "y"}`}
            </p>
          </div>
        </div>
      )}

      {result.status === "error" && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">Invalidation failed</p>
            <p className="mt-1 text-red-400/80">{result.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
