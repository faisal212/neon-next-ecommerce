import Link from "next/link";
import { User, Package, Heart, Settings } from "lucide-react";
import { AccountTabHighlighter } from "./account-tab-highlighter";
import { AccountMoreMenu } from "./account-more-menu";

const primaryTabs = [
  { href: "/account", label: "Dashboard", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/profile", label: "Profile", icon: Settings },
];

export function AccountMobileNav() {
  return (
    <nav className="lg:hidden mb-6 border-b border-outline-variant/10">
      <div className="flex">
        {primaryTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            data-href={tab.href}
            className="account-tab flex flex-1 flex-col items-center gap-1 border-b-2 border-transparent py-3 text-[11px] font-medium text-on-surface-variant transition-colors hover:text-white"
          >
            <tab.icon size={18} />
            {tab.label}
          </Link>
        ))}
        <AccountMoreMenu />
      </div>
      <AccountTabHighlighter />
    </nav>
  );
}
