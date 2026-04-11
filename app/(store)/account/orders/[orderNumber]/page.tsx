import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import {
  OrderDetail,
  OrderDetailSkeleton,
} from "./_components/order-detail";

export async function generateMetadata(props: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await props.params;
  return {
    title: `Order #${orderNumber}`,
    description: `View details for order #${orderNumber}.`,
  };
}

/**
 * Order detail — static shell (breadcrumbs + title) + one streamed island.
 * Title is pulled from `params` so it's synchronous and can prerender.
 */
export default async function OrderDetailPage(props: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await props.params;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Orders", href: "/account/orders" },
          { label: `#${orderNumber}` },
        ]}
      />

      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        Order #{orderNumber}
      </h1>

      <Suspense
        key={`order-${orderNumber}`}
        fallback={<OrderDetailSkeleton />}
      >
        <OrderDetail orderNumber={orderNumber} />
      </Suspense>
    </div>
  );
}
