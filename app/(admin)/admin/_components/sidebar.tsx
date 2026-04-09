"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Warehouse,
  ShoppingCart,
  Zap,
  Settings,
  BarChart3,
  LogOut,
  ChevronRight,
  Star,
  RotateCcw,
  MapPin,
  Users,
  MessageSquare,
  Ticket,
  Image,
  Gift,
  UserPlus,
  Search,
  Bell,
  Shield,
  FileText,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";

interface AdminUser {
  name: string;
  role: string;
}

const navSections = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Add Product", href: "/admin/products/new", icon: PlusCircle },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    label: "Orders",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Returns", href: "/admin/returns", icon: RotateCcw },
      { label: "Delivery Zones", href: "/admin/delivery-zones", icon: MapPin },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Tickets", href: "/admin/tickets", icon: MessageSquare },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Flash Sales", href: "/admin/flash-sales", icon: Zap },
      { label: "Coupons", href: "/admin/coupons", icon: Ticket },
      { label: "Banners", href: "/admin/banners", icon: Image },
      { label: "Loyalty", href: "/admin/loyalty", icon: Gift },
      { label: "Referrals", href: "/admin/referrals", icon: UserPlus },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Navigation", href: "/admin/navigation", icon: ChevronRight },
      { label: "SEO", href: "/admin/seo", icon: Search },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Admin Users", href: "/admin/admin-users", icon: Shield },
      { label: "Activity Logs", href: "/admin/activity-logs", icon: FileText },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function Sidebar({ admin }: { admin: AdminUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const initials = admin.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] min-w-[260px] flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <span className="absolute inset-0 rounded-lg bg-primary/20" />
          <span className="pulse-dot absolute h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </div>
        <div>
          <span className="text-[15px] font-bold tracking-tight text-sidebar-foreground">
            PK Admin
          </span>
          <span className="ml-1.5 rounded bg-primary/10 px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-primary">
            v1
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-1">
            <div className="mb-1 px-3 pt-4 text-[10px] font-semibold uppercase tracking-[1.5px] text-zinc-600">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    {/* Active indicator bar */}
                    <span
                      className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-all duration-300 ${
                        active
                          ? "scale-y-100 opacity-100"
                          : "scale-y-0 opacity-0 group-hover:scale-y-50 group-hover:opacity-40"
                      }`}
                    />

                    <item.icon
                      className={`h-[17px] w-[17px] shrink-0 transition-all duration-200 ${
                        active
                          ? "text-primary"
                          : "text-zinc-600 group-hover:text-zinc-400"
                      }`}
                    />

                    <span className="flex-1">{item.label}</span>

                    {/* Hover arrow */}
                    <ChevronRight
                      className={`h-3 w-3 transition-all duration-200 ${
                        active
                          ? "text-primary/50 opacity-100"
                          : "opacity-0 -translate-x-1 text-zinc-600 group-hover:translate-x-0 group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
          <div className="relative">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-[12px] font-bold text-white shadow-lg shadow-emerald-500/20">
              {initials}
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-sidebar-foreground">
              {admin.name}
            </div>
            <div className="mt-0.5 text-[10px] font-medium text-primary">
              {admin.role
                .replace("_", " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="rounded-md p-1.5 text-zinc-600 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
