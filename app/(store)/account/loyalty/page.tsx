import type { Metadata } from "next";
import { Star, TrendingUp, TrendingDown, Info } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getBalance, getPointsHistory } from "@/lib/services/loyalty.service";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { EmptyState } from "@/components/store/empty-state";

export const metadata: Metadata = {
  title: "Loyalty Points",
  description: "View your loyalty points balance and transaction history.",
};

export default async function LoyaltyPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const ITEMS_PER_PAGE = 20;

  let user = null;
  let balance = 0;
  let totalEarned = 0;
  let totalRedeemed = 0;
  let transactions: Awaited<ReturnType<typeof getPointsHistory>>["data"] = [];
  let total = 0;

  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }

  if (user) {
    try {
      const balanceData = await getBalance(user.id);
      balance = balanceData.balance;
      totalEarned = balanceData.totalEarned;
      totalRedeemed = balanceData.totalRedeemed;
    } catch {
      // DB not connected
    }

    try {
      const result = await getPointsHistory(user.id, {
        page,
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
      });
      transactions = result.data;
      total = result.total;
    } catch {
      // DB not connected
    }
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Loyalty Points" },
        ]}
      />

      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        Loyalty Points
      </h1>
      <p className="mt-1 text-on-surface-variant">
        Track your points and rewards.
      </p>

      {/* Balance display */}
      <div className="relative mt-8 overflow-hidden rounded-lg border border-primary/20 bg-surface-container p-8">
        {/* Ember glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Star size={16} className="text-primary" />
            Current Balance
          </div>
          <p className="mt-2 text-5xl font-black tracking-tight text-primary">
            {balance.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">points</p>

          <div className="mt-6 flex gap-8">
            <div>
              <p className="text-xs text-on-surface-variant">Total Earned</p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-green-400">
                <TrendingUp size={14} />
                {totalEarned.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Total Redeemed</p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-tertiary">
                <TrendingDown size={14} />
                {totalRedeemed.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 flex items-start gap-3 rounded-lg bg-surface-container-low p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-sm text-on-surface-variant">
          Earn <span className="font-bold text-white">1 point</span> for every{" "}
          <span className="font-bold text-white">Rs. 100</span> spent. Points
          can be redeemed for discounts on future orders.
        </p>
      </div>

      {/* Transaction history */}
      <div className="mt-10">
        <h2 className="text-lg font-bold">Transaction History</h2>

        {transactions.length > 0 ? (
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
                    <td className="px-4 py-3 text-sm">
                      {tx.description ?? "--"}
                    </td>
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
        ) : (
          <div className="mt-4">
            <EmptyState
              icon={<Star size={28} />}
              title="No transactions yet"
              description="Start earning points by placing your first order."
              action={{ label: "Shop Now", href: "/products" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
