import { sql, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { returnRequests } from "@/lib/db/schema/support";
import { users } from "@/lib/db/schema/users";
import { orders } from "@/lib/db/schema/orders";
import { PageHeader } from "../../_components/page-header";
import { ReturnsClient } from "./_components/returns-client";

export default async function ReturnsPage() {
  const returnList = await db
    .select({
      id: returnRequests.id,
      orderId: returnRequests.orderId,
      userId: returnRequests.userId,
      reason: returnRequests.reason,
      description: returnRequests.description,
      status: returnRequests.status,
      resolution: returnRequests.resolution,
      createdAt: returnRequests.createdAt,
      customerName: users.name,
      customerEmail: users.email,
      orderNumber: orders.orderNumber,
    })
    .from(returnRequests)
    .leftJoin(users, eq(returnRequests.userId, users.id))
    .leftJoin(orders, eq(returnRequests.orderId, orders.id))
    .orderBy(desc(returnRequests.createdAt));

  // Get status counts
  const statusCounts = await db
    .select({
      status: returnRequests.status,
      count: sql<number>`count(*)::int`,
    })
    .from(returnRequests)
    .groupBy(returnRequests.status);

  const countMap: Record<string, number> = {};
  let totalAll = 0;
  for (const sc of statusCounts) {
    countMap[sc.status] = sc.count;
    totalAll += sc.count;
  }

  const serialized = returnList.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="Returns" />
      <ReturnsClient
        returns={serialized}
        countMap={countMap}
        totalAll={totalAll}
      />
    </>
  );
}
