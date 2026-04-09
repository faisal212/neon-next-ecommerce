import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  Star,
  RotateCcw,
  MapPin,
  Heart,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listUserOrders } from "@/lib/services/order.service";
import { getBalance } from "@/lib/services/loyalty.service";
import { listUserReturns } from "@/lib/services/return.service";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Cover account, orders, and preferences.",
};

const quickLinks = [
  {
    href: "/account/orders",
    label: "Orders",
    description: "Track and manage your orders",
    icon: Package,
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    description: "Manage shipping addresses",
    icon: MapPin,
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    description: "Your saved products",
    icon: Heart,
  },
  {
    href: "/account/support",
    label: "Support",
    description: "Get help with your orders",
    icon: MessageSquare,
  },
];

export default async function AccountDashboardPage() {
  let user = null;
  let totalOrders = 0;
  let loyaltyBalance = 0;
  let activeReturns = 0;
  let recentOrders: Awaited<ReturnType<typeof listUserOrders>>["data"] = [];

  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }

  if (user) {
    try {
      const ordersResult = await listUserOrders(user.id, {
        page: 1,
        limit: 3,
        offset: 0,
      });
      recentOrders = ordersResult.data;
      totalOrders = ordersResult.total;
    } catch {
      // DB not connected
    }

    try {
      const balance = await getBalance(user.id);
      loyaltyBalance = balance.balance;
    } catch {
      // DB not connected
    }

    try {
      const returnsResult = await listUserReturns(user.id, {
        page: 1,
        limit: 100,
        offset: 0,
      });
      activeReturns = returnsResult.data.filter(
        (r) => r.status !== "completed" && r.status !== "rejected",
      ).length;
    } catch {
      // DB not connected
    }
  }

  const displayName = user?.name ?? "there";

  return (
    <div>
      {/* Welcome */}
      <h1 className="text-2xl font-bold tracking-tight">
        Welcome back, {displayName}!
      </h1>
      <p className="mt-1 text-on-surface-variant">
        Here&apos;s a quick overview of your account.
      </p>

      {/* Quick stats */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-surface-container p-6">
          <div className="flex items-center gap-3">
            <Package size={20} className="text-primary" />
            <span className="text-sm text-on-surface-variant">
              Total Orders
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold">{totalOrders}</p>
        </div>

        <div className="rounded-lg bg-surface-container p-6">
          <div className="flex items-center gap-3">
            <Star size={20} className="text-primary" />
            <span className="text-sm text-on-surface-variant">
              Loyalty Points
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold">{loyaltyBalance}</p>
        </div>

        <div className="rounded-lg bg-surface-container p-6">
          <div className="flex items-center gap-3">
            <RotateCcw size={20} className="text-primary" />
            <span className="text-sm text-on-surface-variant">
              Active Returns
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold">{activeReturns}</p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-12">
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
          <div className="mt-4 rounded-lg border border-outline-variant/10 bg-surface-container p-8 text-center">
            <Package size={28} className="mx-auto text-on-surface-variant" />
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

      {/* Quick links */}
      <div className="mt-12">
        <h2 className="text-lg font-bold">Quick Links</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-4 rounded-lg border border-outline-variant/10 bg-surface-container p-5 transition-colors hover:bg-surface-container-high"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary-fixed">
                <link.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">{link.label}</p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
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
