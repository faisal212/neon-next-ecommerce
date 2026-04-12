import { redirect } from "next/navigation";
import { Package, Star, RotateCcw } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listUserOrders } from "@/lib/services/order.service";
import { getBalance } from "@/lib/services/loyalty.service";
import { listUserReturns } from "@/lib/services/return.service";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dynamic island: three dashboard stat cards (total orders, loyalty balance,
 * active returns). All three queries run in parallel inside this island so the
 * whole stats block streams in together — avoids three competing loading
 * states and keeps the mental model simple.
 */
export async function DashboardStats() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }
  if (!user) {
    redirect("/auth/login?callbackUrl=/account");
  }

  let totalOrders = 0;
  let loyaltyBalance = 0;
  let activeReturns = 0;

  try {
    const [ordersResult, balance, returnsResult] = await Promise.all([
      listUserOrders(user.id, { page: 1, limit: 1, offset: 0 }),
      getBalance(user.id),
      listUserReturns(user.id, { page: 1, limit: 100, offset: 0 }),
    ]);

    totalOrders = ordersResult.total;
    loyaltyBalance = balance.balance;
    activeReturns = returnsResult.data.filter(
      (r) => r.status !== "completed" && r.status !== "rejected",
    ).length;
  } catch {
    // DB not connected — render zeroes
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={<Package size={20} className="text-primary" />}
        label="Total Orders"
        value={totalOrders}
      />
      <StatCard
        icon={<Star size={20} className="text-primary" />}
        label="Loyalty Points"
        value={loyaltyBalance}
      />
      <StatCard
        icon={<RotateCcw size={20} className="text-primary" />}
        label="Active Returns"
        value={activeReturns}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div
      className="rounded-lg bg-surface-container p-6"
      style={{ minHeight: 128 }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-on-surface-variant">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
  );
}
