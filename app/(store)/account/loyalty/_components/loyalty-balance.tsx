import { redirect } from "next/navigation";
import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getBalance } from "@/lib/services/loyalty.service";
import { Skeleton } from "@/components/ui/skeleton";

const CARD_MIN_HEIGHT = 220;

/**
 * Dynamic island: the loyalty points balance card (current balance +
 * lifetime earned + lifetime redeemed).
 */
export async function LoyaltyBalance() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }
  if (!user) {
    redirect("/auth/login?callbackUrl=/account/loyalty");
  }

  let balance = 0;
  let totalEarned = 0;
  let totalRedeemed = 0;

  try {
    const data = await getBalance(user.id);
    balance = data.balance;
    totalEarned = data.totalEarned;
    totalRedeemed = data.totalRedeemed;
  } catch {
    // DB not connected
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-primary/20 bg-surface-container p-8"
      style={{ minHeight: CARD_MIN_HEIGHT }}
    >
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
  );
}

export function LoyaltyBalanceSkeleton() {
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-primary/20 bg-surface-container p-8"
      style={{ minHeight: CARD_MIN_HEIGHT }}
    >
      <Skeleton className="h-4 w-32 bg-surface-container-high" />
      <Skeleton className="mt-3 h-12 w-40 bg-surface-container-high" />
      <Skeleton className="mt-2 h-3 w-12 bg-surface-container-high" />
      <div className="mt-6 flex gap-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20 bg-surface-container-high" />
          <Skeleton className="h-4 w-16 bg-surface-container-high" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24 bg-surface-container-high" />
          <Skeleton className="h-4 w-16 bg-surface-container-high" />
        </div>
      </div>
    </div>
  );
}
