import type { Metadata } from "next";
import { MapPin, Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listAddresses } from "@/lib/services/address.service";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { EmptyState } from "@/components/store/empty-state";

export const metadata: Metadata = {
  title: "My Addresses",
  description: "Manage your saved shipping addresses.",
};

export default async function AddressesPage() {
  let user = null;
  let addresses: Awaited<ReturnType<typeof listAddresses>> = [];

  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }

  if (user) {
    try {
      addresses = await listAddresses(user.id);
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
          { label: "Addresses" },
        ]}
      />

      <h1 className="mt-6 text-2xl font-bold tracking-tight">My Addresses</h1>
      <p className="mt-1 text-on-surface-variant">
        Manage your saved shipping addresses.
      </p>

      {addresses.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="relative rounded-lg border border-outline-variant/10 bg-surface-container p-5"
            >
              {address.isDefault && (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                  <Star size={12} />
                  Default
                </span>
              )}
              <p className="text-sm font-bold">{address.firstName} {address.lastName}</p>
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
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={<MapPin size={28} />}
            title="No addresses saved"
            description="Add a shipping address to make checkout faster."
          />
        </div>
      )}
    </div>
  );
}
