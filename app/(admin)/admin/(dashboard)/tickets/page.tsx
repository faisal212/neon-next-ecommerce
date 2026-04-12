import { sql, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { supportTickets } from "@/lib/db/schema/support";
import { users } from "@/lib/db/schema/users";
import { PageHeader } from "../../_components/page-header";
import { TicketsClient } from "./_components/tickets-client";

export default async function TicketsPage() {
  const ticketList = await db
    .select({
      id: supportTickets.id,
      ticketNumber: supportTickets.ticketNumber,
      userId: supportTickets.userId,
      orderId: supportTickets.orderId,
      category: supportTickets.category,
      subject: supportTickets.subject,
      status: supportTickets.status,
      priority: supportTickets.priority,
      createdAt: supportTickets.createdAt,
      customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as('customer_name'),
      customerEmail: users.email,
    })
    .from(supportTickets)
    .leftJoin(users, eq(supportTickets.userId, users.id))
    .orderBy(desc(supportTickets.createdAt));

  // Get status counts
  const statusCounts = await db
    .select({
      status: supportTickets.status,
      count: sql<number>`count(*)::int`,
    })
    .from(supportTickets)
    .groupBy(supportTickets.status);

  const countMap: Record<string, number> = {};
  let totalAll = 0;
  for (const sc of statusCounts) {
    countMap[sc.status] = sc.count;
    totalAll += sc.count;
  }

  const serialized = ticketList.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="Support Tickets" />
      <TicketsClient
        tickets={serialized}
        countMap={countMap}
        totalAll={totalAll}
      />
    </>
  );
}
