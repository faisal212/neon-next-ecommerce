import { Suspense } from "react";
import type { Metadata } from "next";
import { Info } from "lucide-react";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import {
  LoyaltyBalance,
  LoyaltyBalanceSkeleton,
} from "./_components/loyalty-balance";
import {
  LoyaltyHistory,
  LoyaltyHistorySkeleton,
} from "./_components/loyalty-history";

export const metadata: Metadata = {
  title: "Loyalty Points",
  description: "View your loyalty points balance and transaction history.",
};

/**
 * Loyalty — static shell + two streamed islands (balance card streams first,
 * history streams as a separate boundary so it doesn't block the balance).
 */
export default async function LoyaltyPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Loyalty Points" },
        ]}
      />

      <h1 className="mt-6 text-2xl font-bold tracking-tight">Loyalty Points</h1>
      <p className="mt-1 text-on-surface-variant">
        Track your points and rewards.
      </p>

      {/* Balance island */}
      <div className="mt-8">
        <Suspense fallback={<LoyaltyBalanceSkeleton />}>
          <LoyaltyBalance />
        </Suspense>
      </div>

      {/* Static info block */}
      <div className="mt-4 flex items-start gap-3 rounded-lg bg-surface-container-low p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-sm text-on-surface-variant">
          Earn <span className="font-bold text-white">1 point</span> for every{" "}
          <span className="font-bold text-white">Rs. 100</span> spent. Points
          can be redeemed for discounts on future orders.
        </p>
      </div>

      {/* Transaction history island */}
      <div className="mt-10">
        <h2 className="text-lg font-bold">Transaction History</h2>
        <Suspense
          key={`loyalty-${page}`}
          fallback={<LoyaltyHistorySkeleton />}
        >
          <LoyaltyHistory page={page} />
        </Suspense>
      </div>
    </div>
  );
}
