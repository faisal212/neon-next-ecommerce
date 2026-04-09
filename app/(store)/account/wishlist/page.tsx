import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getWishlistWithItems } from "@/lib/services/wishlist.service";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { EmptyState } from "@/components/store/empty-state";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Your saved products and wishlist items.",
};

export default async function WishlistPage() {
  let user = null;
  let wishlistItems: Awaited<
    ReturnType<typeof getWishlistWithItems>
  >["items"] = [];

  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }

  if (user) {
    try {
      const wishlist = await getWishlistWithItems(user.id);
      wishlistItems = wishlist.items;
    } catch {
      // DB not connected
    }
  }

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

      {wishlistItems.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-outline-variant/10 bg-surface-container p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest">
                  <Heart size={20} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    Variant: {item.variantId.slice(0, 8)}...
                  </p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    Added{" "}
                    {new Date(item.addedAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={<Heart size={28} />}
            title="Your wishlist is empty"
            description="Browse our collection and save products you love."
            action={{ label: "Browse Products", href: "/products" }}
          />
        </div>
      )}
    </div>
  );
}
