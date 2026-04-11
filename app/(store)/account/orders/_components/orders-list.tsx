import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listUserOrders } from "@/lib/services/order.service";
import { EmptyState } from "@/components/store/empty-state";
import { PaginationControls } from "@/components/store/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";

const ORDERS_PER_PAGE = 10;
const ROW_MIN_HEIGHT = 73;

const statusStyles: Record<string, string> = {
  pending: "bg-tertiary/20 text-tertiary",
  confirmed: "bg-primary/20 text-primary",
  shipped: "bg-blue-500/20 text-blue-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-destructive/20 text-destructive",
};

/**
 * Dynamic island: paginated list of the user's orders.
 * Accepts `page` as a prop (extracted from searchParams by the shell),
 * so Suspense re-runs when pagination changes.
 */
export async function OrdersList({ page }: { page: number }) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }
  if (!user) {
    redirect("/auth/login?callbackUrl=/account/orders");
  }

  let orders: Awaited<ReturnType<typeof listUserOrders>>["data"] = [];
  let total = 0;

  try {
    const result = await listUserOrders(user.id, {
      page,
      limit: ORDERS_PER_PAGE,
      offset: (page - 1) * ORDERS_PER_PAGE,
    });
    orders = result.data;
    total = result.total;
  } catch {
    // DB not connected
  }

  const totalPages = Math.ceil(total / ORDERS_PER_PAGE);

  if (orders.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon={<Package size={28} />}
          title="No orders yet"
          description="When you place an order, it will appear here. Start browsing our collection."
          action={{ label: "Browse Products", href: "/products" }}
        />
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="mt-8 hidden overflow-hidden rounded-lg border border-outline-variant/10 md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/10 bg-surface-container-low">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="bg-surface-container transition-colors hover:bg-surface-container-high"
              >
                <td className="px-4 py-4">
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-4 text-sm text-on-surface-variant">
                  {new Date(order.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusStyles[order.status] ?? "bg-surface-container-highest text-on-surface-variant"}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-sm font-bold">
                  Rs. {Number(order.totalPkr).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-8 flex flex-col gap-3 md:hidden">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.orderNumber}`}
            className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container p-4 transition-colors hover:bg-surface-container-high"
            style={{ minHeight: ROW_MIN_HEIGHT }}
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
            <div className="flex flex-col items-end gap-1.5">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusStyles[order.status] ?? "bg-surface-container-highest text-on-surface-variant"}`}
              >
                {order.status}
              </span>
              <span className="text-sm font-bold">
                Rs. {Number(order.totalPkr).toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            basePath="/account/orders"
          />
        </div>
      )}
    </>
  );
}

export function OrdersListSkeleton() {
  return (
    <>
      {/* Desktop table skeleton */}
      <div className="mt-8 hidden overflow-hidden rounded-lg border border-outline-variant/10 md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/10 bg-surface-container-low">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {Array.from({ length: ORDERS_PER_PAGE }).map((_, i) => (
              <tr key={i} className="bg-surface-container">
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-24 bg-surface-container-high" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-28 bg-surface-container-high" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-5 w-16 rounded-full bg-surface-container-high" />
                </td>
                <td className="px-4 py-4 text-right">
                  <Skeleton className="ml-auto h-4 w-20 bg-surface-container-high" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards skeleton */}
      <div className="mt-8 flex flex-col gap-3 md:hidden">
        {Array.from({ length: ORDERS_PER_PAGE }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container p-4"
            style={{ minHeight: ROW_MIN_HEIGHT }}
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 bg-surface-container-high" />
              <Skeleton className="h-3 w-28 bg-surface-container-high" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full bg-surface-container-high" />
              <Skeleton className="h-4 w-20 bg-surface-container-high" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
