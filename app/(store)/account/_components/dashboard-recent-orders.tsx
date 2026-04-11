import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listUserOrders } from "@/lib/services/order.service";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dynamic island: the three most-recent orders. Streams in behind
 * <DashboardRecentOrdersSkeleton />. The skeleton box height matches the
 * populated-list box height so the Quick Links below don't shift when
 * streaming completes (CLS guard).
 */
export async function DashboardRecentOrders() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }
  if (!user) {
    redirect("/auth/login?callbackUrl=/account");
  }

  let recentOrders: Awaited<ReturnType<typeof listUserOrders>>["data"] = [];
  let totalOrders = 0;

  try {
    const result = await listUserOrders(user.id, {
      page: 1,
      limit: 3,
      offset: 0,
    });
    recentOrders = result.data;
    totalOrders = result.total;
  } catch {
    // DB not connected
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Recent Orders</h2>
        {totalOrders > 0 && (
          <Link
            href="/account/orders"
            className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {recentOrders.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.orderNumber}`}
              className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container p-4 transition-colors hover:bg-surface-container-high"
              style={{ minHeight: 68 }}
            >
              <div>
                <p className="text-sm font-bold">#{order.orderNumber}</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {new Date(order.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                <span className="text-sm font-bold">
                  Rs. {Number(order.totalPkr).toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div
          className="mt-4 flex flex-col items-center justify-center rounded-lg border border-outline-variant/10 bg-surface-container p-8 text-center"
          style={{ minHeight: 228 }}
        >
          <Package size={28} className="text-on-surface-variant" />
          <p className="mt-3 text-sm text-on-surface-variant">
            No orders yet. Start shopping to see your orders here.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}

export function DashboardRecentOrdersSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 bg-surface-container" />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container p-4"
            style={{ minHeight: 68 }}
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 bg-surface-container-high" />
              <Skeleton className="h-3 w-32 bg-surface-container-high" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-16 rounded-full bg-surface-container-high" />
              <Skeleton className="h-4 w-20 bg-surface-container-high" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-tertiary/20 text-tertiary",
    confirmed: "bg-primary/20 text-primary",
    shipped: "bg-blue-500/20 text-blue-400",
    delivered: "bg-green-500/20 text-green-400",
    cancelled: "bg-destructive/20 text-destructive",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${styles[status] ?? "bg-surface-container-highest text-on-surface-variant"}`}
    >
      {status}
    </span>
  );
}
