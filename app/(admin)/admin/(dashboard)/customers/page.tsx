import { eq, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { orders } from "@/lib/db/schema/orders";
import { PageHeader } from "../../_components/page-header";
import { CustomersTable } from "./_components/customers-table";

export default async function CustomersPage() {
  const customerList = await db
    .select({
      id: users.id,
      name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as('name'),
      email: users.email,
      phonePk: users.phonePk,
      isActive: users.isActive,
      createdAt: users.createdAt,
      orderCount: sql<number>`count(${orders.id})::int`,
      totalSpend: sql<string>`coalesce(sum(${orders.totalPkr}), '0')`,
    })
    .from(users)
    .leftJoin(orders, eq(users.id, orders.userId))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  const serialized = customerList.map((c) => ({
    ...c,
    phonePk: c.phonePk || "—",
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="Customers" subtitle={`${serialized.length} registered customers`} />
      <CustomersTable data={serialized} />
    </>
  );
}
