import { sql, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import { PageHeader } from "../../_components/page-header";
import { OrdersClient } from "./_components/orders-client";

export default async function OrdersPage() {
  const orderList = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  // Get status counts
  const statusCounts = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .groupBy(orders.status);

  const countMap: Record<string, number> = {};
  let totalAll = 0;
  for (const sc of statusCounts) {
    countMap[sc.status] = sc.count;
    totalAll += sc.count;
  }

  const serialized = orderList.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="Orders" />
      <OrdersClient orders={serialized} countMap={countMap} totalAll={totalAll} />
    </>
  );
}
