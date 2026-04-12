"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Star,
  RotateCcw,
  MessageSquare,
  Ellipsis,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const overflowTabs = [
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/loyalty", label: "Loyalty Points", icon: Star },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
  { href: "/account/support", label: "Support", icon: MessageSquare },
];

export function AccountMoreMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const moreIsActive = overflowTabs.some((t) =>
    t.href === "/account"
      ? pathname === "/account"
      : pathname.startsWith(t.href),
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={`flex flex-1 flex-col items-center gap-1 border-b-2 py-3 text-[11px] font-medium transition-colors ${
          moreIsActive
            ? "border-primary text-primary"
            : "border-transparent text-on-surface-variant hover:text-white"
        }`}
      >
        <Ellipsis size={18} />
        More
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="border-outline-variant/10 bg-surface rounded-t-2xl"
      >
        <SheetHeader>
          <SheetTitle className="text-lg font-black text-white">
            More
          </SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3 px-4 pb-8">
          {overflowTabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setOpen(false)}
                className={`flex flex-col items-center gap-2 rounded-xl p-5 transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-white"
                }`}
              >
                <tab.icon size={24} />
                <span className="text-sm font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
