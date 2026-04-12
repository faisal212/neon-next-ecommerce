import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { OrdersList, OrdersListSkeleton } from "./_components/orders-list";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and track all your orders.",
};

/**
 * Orders list — static shell + one streamed island.
 *
 * The island is keyed on `page` so pagination changes re-trigger Suspense.
 */
export default async function OrdersPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Orders" },
        ]}
      />

      <h1 className="mt-6 text-2xl font-bold tracking-tight">My Orders</h1>
      <p className="mt-1 text-on-surface-variant">
        Track and manage all your orders.
      </p>

      <Suspense key={`orders-${page}`} fallback={<OrdersListSkeleton />}>
        <OrdersList page={page} />
      </Suspense>
    </div>
  );
}
