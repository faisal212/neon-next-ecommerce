import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Package, MapPin, Heart, MessageSquare } from "lucide-react";
import {
  DashboardGreeting,
  DashboardGreetingSkeleton,
} from "./_components/dashboard-greeting";
import {
  DashboardStats,
  DashboardStatsSkeleton,
} from "./_components/dashboard-stats";
import {
  DashboardRecentOrders,
  DashboardRecentOrdersSkeleton,
} from "./_components/dashboard-recent-orders";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Refine account, orders, and preferences.",
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

/**
 * Dashboard — static shell with three streamed islands.
 *
 * Islands:
 *  - <DashboardGreeting /> — user's first name in the welcome heading
 *  - <DashboardStats /> — three parallel-queried stat cards
 *  - <DashboardRecentOrders /> — most-recent 3 orders or empty state
 *
 * Everything else (subheading, Quick Links, section headings) is pure JSX
 * and prerendered by Cache Components.
 */
export default function AccountDashboardPage() {
  return (
    <div>
      {/* Welcome */}
      <Suspense fallback={<DashboardGreetingSkeleton />}>
        <DashboardGreeting />
      </Suspense>
      <p className="mt-1 text-on-surface-variant">
        Here&apos;s a quick overview of your account.
      </p>

      {/* Quick stats */}
      <div className="mt-8">
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats />
        </Suspense>
      </div>

      {/* Recent orders */}
      <div className="mt-12">
        <Suspense fallback={<DashboardRecentOrdersSkeleton />}>
          <DashboardRecentOrders />
        </Suspense>
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
