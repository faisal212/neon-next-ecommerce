import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrderByNumber } from "@/lib/services/order.service";
import { GradientButton } from "@/components/store/gradient-button";
import { Skeleton } from "@/components/ui/skeleton";

const ORDER_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

function getStepIndex(status: string): number {
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

/**
 * Dynamic island: the full detail view for one order.
 * Everything that depends on the order record lives here — date, status
 * badge, timeline, courier, items, price breakdown, history, actions.
 */
export async function OrderDetail({ orderNumber }: { orderNumber: string }) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }
  if (!user) {
    redirect(`/auth/login?callbackUrl=/account/orders/${orderNumber}`);
  }

  let order: Awaited<ReturnType<typeof getOrderByNumber>> | null = null;
  try {
    order = await getOrderByNumber(orderNumber, user.id);
  } catch {
    // Order not found or DB not connected
  }

  if (!order) {
    return (
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <p className="mt-2 text-on-surface-variant">
          We couldn&apos;t find this order. It may not exist or you may not
          have access.
        </p>
        <GradientButton href="/account/orders" className="mt-8">
          Back to Orders
        </GradientButton>
      </div>
    );
  }

  const currentStep =
    order.status === "cancelled" ? -1 : getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="mt-1 text-sm text-on-surface-variant">
        Placed on{" "}
        {new Date(order.createdAt).toLocaleDateString("en-PK", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="mt-8 rounded-lg border border-outline-variant/10 bg-surface-container p-6">
          <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Order Progress
          </h2>
          <div className="flex items-center justify-between">
            {ORDER_STEPS.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        isCompleted
                          ? "bg-primary text-on-primary-fixed"
                          : "bg-surface-container-highest text-on-surface-variant"
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                      )}
                      <Icon size={18} className="relative z-10" />
                    </div>
                    <span
                      className={`text-xs font-bold ${isCompleted ? "text-primary" : "text-on-surface-variant"}`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connector line */}
                  {index < ORDER_STEPS.length - 1 && (
                    <div className="mx-2 h-0.5 flex-1">
                      <div
                        className={`h-full rounded-full ${
                          index < currentStep
                            ? "bg-primary"
                            : "bg-surface-container-highest"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled notice */}
      {isCancelled && (
        <div className="mt-8 rounded-lg border border-destructive/20 bg-destructive/10 p-6">
          <p className="text-sm font-bold text-destructive">
            This order has been cancelled.
          </p>
        </div>
      )}

      {/* Courier tracking */}
      {order.courier && (
        <div className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Tracking Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-on-surface-variant">Courier</p>
              <p className="mt-0.5 text-sm font-bold">
                {order.courier.courierName}
              </p>
            </div>
            {order.courier.trackingNumber && (
              <div>
                <p className="text-xs text-on-surface-variant">
                  Tracking Number
                </p>
                <p className="mt-0.5 text-sm font-bold font-mono">
                  {order.courier.trackingNumber}
                </p>
              </div>
            )}
            {order.courier.riderName && (
              <div>
                <p className="text-xs text-on-surface-variant">Rider</p>
                <p className="mt-0.5 text-sm font-bold">
                  {order.courier.riderName}
                </p>
              </div>
            )}
            {order.courier.riderPhone && (
              <div>
                <p className="text-xs text-on-surface-variant">Rider Phone</p>
                <p className="mt-0.5 text-sm font-bold">
                  {order.courier.riderPhone}
                </p>
              </div>
            )}
            {order.courier.estimatedDelivery && (
              <div>
                <p className="text-xs text-on-surface-variant">
                  Estimated Delivery
                </p>
                <p className="mt-0.5 text-sm font-bold">
                  {new Date(
                    order.courier.estimatedDelivery,
                  ).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-on-surface-variant">
          Items ({order.items.length})
        </h2>
        <div className="divide-y divide-outline-variant/10">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-bold">
                  Variant: {item.variantId.slice(0, 8)}...
                </p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  Qty: {item.quantity} x Rs.{" "}
                  {Number(item.unitPricePkr).toLocaleString()}
                </p>
              </div>
              <p className="text-sm font-bold">
                Rs. {Number(item.totalPkr).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-on-surface-variant">
          Price Summary
        </h2>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Subtotal</span>
            <span>Rs. {Number(order.subtotalPkr).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Shipping</span>
            <span>Rs. {Number(order.shippingChargePkr).toLocaleString()}</span>
          </div>
          {Number(order.codChargePkr) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">COD Fee</span>
              <span>Rs. {Number(order.codChargePkr).toLocaleString()}</span>
            </div>
          )}
          {Number(order.discountPkr) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Discount</span>
              <span className="text-green-400">
                -Rs. {Number(order.discountPkr).toLocaleString()}
              </span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-outline-variant/10 pt-3 text-base font-bold">
            <span>Total</span>
            <span className="text-primary">
              Rs. {Number(order.totalPkr).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Status history */}
      {order.statusHistory.length > 0 && (
        <div className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Status History
          </h2>
          <div className="flex flex-col gap-3">
            {order.statusHistory.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-bold capitalize">{entry.status}</p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(entry.createdAt).toLocaleString("en-PK")}
                    {entry.notes && ` — ${entry.notes}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 flex flex-wrap gap-3">
        {order.status === "delivered" && (
          <Link
            href="/account/returns"
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/10 bg-surface-container px-5 py-2.5 text-sm font-bold transition-colors hover:bg-surface-container-high"
          >
            <RotateCcw size={16} />
            Request Return
          </Link>
        )}
        <Link
          href="/account/support"
          className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/10 bg-surface-container px-5 py-2.5 text-sm font-bold transition-colors hover:bg-surface-container-high"
        >
          <MessageSquare size={16} />
          Contact Support
        </Link>
      </div>
    </>
  );
}

export function OrderDetailSkeleton() {
  return (
    <>
      <div className="mt-2">
        <Skeleton className="h-6 w-20 rounded-full bg-surface-container" />
      </div>
      <Skeleton className="mt-2 h-4 w-48 bg-surface-container" />

      <div
        className="mt-8 rounded-lg border border-outline-variant/10 bg-surface-container p-6"
        style={{ minHeight: 160 }}
      >
        <Skeleton className="h-4 w-32 bg-surface-container-high" />
        <div className="mt-6 flex items-center justify-between gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full bg-surface-container-high" />
              <Skeleton className="h-3 w-14 bg-surface-container-high" />
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container p-6"
        style={{ minHeight: 180 }}
      >
        <Skeleton className="h-4 w-24 bg-surface-container-high" />
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-outline-variant/10 py-3 last:border-0"
            >
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32 bg-surface-container-high" />
                <Skeleton className="h-3 w-24 bg-surface-container-high" />
              </div>
              <Skeleton className="h-4 w-20 bg-surface-container-high" />
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container p-6"
        style={{ minHeight: 180 }}
      >
        <Skeleton className="h-4 w-28 bg-surface-container-high" />
        <div className="mt-4 flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between border-b border-outline-variant/10 py-2 last:border-0"
            >
              <Skeleton className="h-3 w-20 bg-surface-container-high" />
              <Skeleton className="h-3 w-16 bg-surface-container-high" />
            </div>
          ))}
        </div>
      </div>
    </>
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
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${styles[status] ?? "bg-surface-container-highest text-on-surface-variant"}`}
    >
      {status}
    </span>
  );
}
