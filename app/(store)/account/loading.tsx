import { Skeleton } from "@/components/ui/skeleton";

/**
 * Navigation fallback for /account/** transitions.
 *
 * With PPR + per-page Suspense islands, the static shells render instantly
 * and this file is only shown for the brief window between clicking a link
 * and the new page's prerendered shell resolving. Shape roughly matches the
 * dashboard (the most common entry point) with fixed dimensions to avoid CLS.
 */
export default function AccountLoading() {
  return (
    <div>
      {/* Heading */}
      <Skeleton className="h-8 w-64 bg-surface-container" />
      <Skeleton className="mt-2 h-4 w-80 bg-surface-container" />

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg bg-surface-container p-6"
            style={{ minHeight: 128 }}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded bg-surface-container-high" />
              <Skeleton className="h-4 w-24 bg-surface-container-high" />
            </div>
            <Skeleton className="mt-3 h-8 w-12 bg-surface-container-high" />
          </div>
        ))}
      </div>

      {/* Section heading */}
      <div className="mt-12">
        <Skeleton className="h-6 w-40 bg-surface-container" />

        {/* List rows */}
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-outline-variant/10 bg-surface-container p-4"
              style={{ minHeight: 68 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24 bg-surface-container-high" />
                  <Skeleton className="h-3 w-32 bg-surface-container-high" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-16 rounded-full bg-surface-container-high" />
                  <Skeleton className="h-4 w-20 bg-surface-container-high" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
