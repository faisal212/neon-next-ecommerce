import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { loyaltyPoints } from "@/lib/db/schema/marketing";
import { users } from "@/lib/db/schema/users";
import { PageHeader } from "../../_components/page-header";
import { LoyaltyClient } from "./_components/loyalty-client";

export default async function LoyaltyPage() {
  const balances = await db
    .select({
      id: loyaltyPoints.id,
      userId: loyaltyPoints.userId,
      totalEarned: loyaltyPoints.totalEarned,
      totalRedeemed: loyaltyPoints.totalRedeemed,
      balance: loyaltyPoints.balance,
      updatedAt: loyaltyPoints.updatedAt,
      userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as('user_name'),
      userEmail: users.email,
    })
    .from(loyaltyPoints)
    .leftJoin(users, eq(loyaltyPoints.userId, users.id))
    .orderBy(desc(loyaltyPoints.updatedAt));

  const serialized = balances.map((b) => ({
    ...b,
    updatedAt: b.updatedAt.toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Loyalty Points"
        subtitle="View and adjust customer point balances"
      />
      <LoyaltyClient balances={serialized} />
    </>
  );
}
