import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import {
  AddressList,
  AddressListSkeleton,
} from "./_components/address-list";

export const metadata: Metadata = {
  title: "My Addresses",
  description: "Manage your saved shipping addresses.",
};

export default function AddressesPage() {
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

      <Suspense fallback={<AddressListSkeleton />}>
        <AddressList />
      </Suspense>
    </div>
  );
}
