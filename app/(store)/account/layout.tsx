import { redirect } from "next/navigation";
import Link from "next/link";
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
import { getCurrentUser } from "@/lib/auth";

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

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;

  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected — allow through with null user for graceful fallback
  }

  if (!user) {
    redirect("/auth/login");
  }

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
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-white"
                  >
                    <link.icon size={18} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-9">{children}</main>
      </div>
    </section>
  );
}
