import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getWishlistWithItems } from "@/lib/services/wishlist.service";
import { EmptyState } from "@/components/store/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const CARD_MIN_HEIGHT = 108;

/**
 * Dynamic island: the user's wishlist items.
 */
export async function WishlistItems() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }
  if (!user) {
    redirect("/auth/login?callbackUrl=/account/wishlist");
  }

  let items: Awaited<ReturnType<typeof getWishlistWithItems>>["items"] = [];
  try {
    const wishlist = await getWishlistWithItems(user.id);
    items = wishlist.items;
  } catch {
    // DB not connected
  }

  if (items.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon={<Heart size={28} />}
          title="Your wishlist is empty"
          description="Browse our collection and save products you love."
          action={{ label: "Browse Products", href: "/products" }}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-outline-variant/10 bg-surface-container p-5"
          style={{ minHeight: CARD_MIN_HEIGHT }}
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
  );
}

export function WishlistItemsSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-outline-variant/10 bg-surface-container p-5"
          style={{ minHeight: CARD_MIN_HEIGHT }}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-lg bg-surface-container-high" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-32 bg-surface-container-high" />
              <Skeleton className="h-3 w-24 bg-surface-container-high" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
