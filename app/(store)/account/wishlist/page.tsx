import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import {
  WishlistItems,
  WishlistItemsSkeleton,
} from "./_components/wishlist-items";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Your saved products and wishlist items.",
};

export default function WishlistPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Wishlist" },
        ]}
      />

      <h1 className="mt-6 text-2xl font-bold tracking-tight">My Wishlist</h1>
      <p className="mt-1 text-on-surface-variant">
        Products you&apos;ve saved for later.
      </p>

      <Suspense fallback={<WishlistItemsSkeleton />}>
        <WishlistItems />
      </Suspense>
    </div>
  );
}
