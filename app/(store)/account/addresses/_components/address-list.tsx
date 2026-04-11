import { redirect } from "next/navigation";
import { MapPin, Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listAddresses } from "@/lib/services/address.service";
import { EmptyState } from "@/components/store/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const CARD_MIN_HEIGHT = 180;

/**
 * Dynamic island: the user's saved shipping addresses.
 */
export async function AddressList() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }
  if (!user) {
    redirect("/auth/login?callbackUrl=/account/addresses");
  }

  let addresses: Awaited<ReturnType<typeof listAddresses>> = [];
  try {
    addresses = await listAddresses(user.id);
  } catch {
    // DB not connected
  }

  if (addresses.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon={<MapPin size={28} />}
          title="No addresses saved"
          description="Add a shipping address to make checkout faster."
        />
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="relative rounded-lg border border-outline-variant/10 bg-surface-container p-5"
          style={{ minHeight: CARD_MIN_HEIGHT }}
        >
          {address.isDefault && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
              <Star size={12} />
              Default
            </span>
          )}
          <p className="text-sm font-bold">
            {address.firstName} {address.lastName}
          </p>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            {address.addressLine1}
          </p>
          {address.addressLine2 && (
            <p className="text-sm text-on-surface-variant">
              {address.addressLine2}
            </p>
          )}
          <p className="text-sm text-on-surface-variant">
            {address.city}, {address.province}
            {address.postalCode && ` ${address.postalCode}`}
          </p>
          {address.phonePk && (
            <p className="mt-2 text-sm text-on-surface-variant">
              {address.phonePk}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function AddressListSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-outline-variant/10 bg-surface-container p-5"
          style={{ minHeight: CARD_MIN_HEIGHT }}
        >
          <Skeleton className="h-5 w-16 rounded-full bg-surface-container-high" />
          <Skeleton className="mt-3 h-4 w-32 bg-surface-container-high" />
          <Skeleton className="mt-2 h-3 w-40 bg-surface-container-high" />
          <Skeleton className="mt-1 h-3 w-36 bg-surface-container-high" />
          <Skeleton className="mt-1 h-3 w-28 bg-surface-container-high" />
          <Skeleton className="mt-3 h-3 w-32 bg-surface-container-high" />
        </div>
      ))}
    </div>
  );
}
