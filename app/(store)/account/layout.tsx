import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import {
  User,
  Package,
  MapPin,
  Heart,
  Star,
  RotateCcw,
  MessageSquare,
  Settings,
} from "lucide-react";
import { SignOutButton } from "./_components/sign-out-button";
import { AccountMobileNav } from "./_components/account-mobile-nav";

const navLinks = [
  { href: "/account", label: "Dashboard", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/loyalty", label: "Loyalty Points", icon: Star },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
  { href: "/account/support", label: "Support", icon: MessageSquare },
  { href: "/account/profile", label: "Profile", icon: Settings },
];

/**
 * Account layout — fully static, cached chrome.
 *
 * Auth is gated upstream by `proxy.ts` (optimistic cookie check) and re-verified
 * inside each page's Suspense island via the DAL (`getCurrentUser`, wrapped in
 * React `cache()`). The layout itself has no user data and no runtime APIs, so
 * it can be cached indefinitely across requests — invalidate via
 * `revalidateTag('account-shell', 'max')` only if the sidebar structure
 * changes (Next.js 16 requires the cacheLife-profile second argument).
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  "use cache";
  cacheLife("max");
  cacheTag("account-shell-v2");

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-12 md:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Sidebar */}
        <aside className="hidden lg:col-span-3 lg:block">
          <h2 className="mb-6 text-lg font-bold tracking-tight">My Account</h2>
          <nav>
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-href={link.href}
                    className="account-tab flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-white"
                  >
                    <link.icon size={18} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 border-t border-outline-variant/10 pt-4">
            <SignOutButton />
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-9">
          <AccountMobileNav />
          {children}
        </main>
      </div>
    </section>
  );
}
