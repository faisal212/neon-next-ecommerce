import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getPointsHistory } from "@/lib/services/loyalty.service";
import { EmptyState } from "@/components/store/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 20;
const ROW_MIN_HEIGHT = 57;

/**
 * Dynamic island: paginated loyalty points transaction history.
 */
export async function LoyaltyHistory({ page }: { page: number }) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }
  if (!user) {
    redirect("/auth/login?callbackUrl=/account/loyalty");
  }

  let transactions: Awaited<ReturnType<typeof getPointsHistory>>["data"] = [];

  try {
    const result = await getPointsHistory(user.id, {
      page,
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
    });
    transactions = result.data;
  } catch {
    // DB not connected
  }

  if (transactions.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState
          icon={<Star size={28} />}
          title="No transactions yet"
          description="Start earning points by placing your first order."
          action={{ label: "Shop Now", href: "/products" }}
        />
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-outline-variant/10">
      {/* Desktop table */}
      <table className="hidden w-full md:table">
        <thead>
          <tr className="border-b border-outline-variant/10 bg-surface-container-low">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Description
            </th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Points
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="bg-surface-container transition-colors hover:bg-surface-container-high"
            >
              <td className="px-4 py-3 text-sm text-on-surface-variant">
                {new Date(tx.createdAt).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-surface-container-highest px-2.5 py-0.5 text-xs font-bold capitalize text-on-surface-variant">
                  {tx.type.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">{tx.description ?? "--"}</td>
              <td className="px-4 py-3 text-right text-sm font-bold">
                <span
                  className={
                    tx.points > 0 ? "text-green-400" : "text-destructive"
                  }
                >
                  {tx.points > 0 ? "+" : ""}
                  {tx.points}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="flex flex-col divide-y divide-outline-variant/10 md:hidden">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between bg-surface-container px-4 py-3"
            style={{ minHeight: ROW_MIN_HEIGHT }}
          >
            <div>
              <p className="text-sm font-bold capitalize">
                {tx.type.replace("_", " ")}
              </p>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                {new Date(tx.createdAt).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {tx.description && (
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {tx.description}
                </p>
              )}
            </div>
            <span
              className={`text-sm font-bold ${
                tx.points > 0 ? "text-green-400" : "text-destructive"
              }`}
            >
              {tx.points > 0 ? "+" : ""}
              {tx.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoyaltyHistorySkeleton() {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-outline-variant/10">
      {/* Desktop table skeleton */}
      <table className="hidden w-full md:table">
        <thead>
          <tr className="border-b border-outline-variant/10 bg-surface-container-low">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Description
            </th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Points
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <tr key={i} className="bg-surface-container">
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20 bg-surface-container-high" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-20 rounded-full bg-surface-container-high" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-40 bg-surface-container-high" />
              </td>
              <td className="px-4 py-3 text-right">
                <Skeleton className="ml-auto h-4 w-12 bg-surface-container-high" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards skeleton */}
      <div className="flex flex-col divide-y divide-outline-variant/10 md:hidden">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-surface-container px-4 py-3"
            style={{ minHeight: ROW_MIN_HEIGHT }}
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 bg-surface-container-high" />
              <Skeleton className="h-3 w-20 bg-surface-container-high" />
            </div>
            <Skeleton className="h-4 w-12 bg-surface-container-high" />
          </div>
        ))}
      </div>
    </div>
  );
}
