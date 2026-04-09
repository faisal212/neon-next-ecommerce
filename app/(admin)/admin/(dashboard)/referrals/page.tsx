import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { referrals } from "@/lib/db/schema/marketing";
import { users } from "@/lib/db/schema/users";
import { PageHeader } from "../../_components/page-header";
import { ReferralsClient } from "./_components/referrals-client";

export default async function ReferralsPage() {
  // Alias users table for referrer and referred joins
  const referrerUser = users;

  const referralList = await db
    .select({
      id: referrals.id,
      referrerUserId: referrals.referrerUserId,
      referredUserId: referrals.referredUserId,
      referralCode: referrals.referralCode,
      rewardGiven: referrals.rewardGiven,
      rewardPoints: referrals.rewardPoints,
      createdAt: referrals.createdAt,
      referrerName: referrerUser.name,
      referrerEmail: referrerUser.email,
    })
    .from(referrals)
    .leftJoin(referrerUser, eq(referrals.referrerUserId, referrerUser.id))
    .orderBy(desc(referrals.createdAt));

  // We need a second query for referred user names since we can't join users table twice
  // in the same select with drizzle-orm easily. We'll fetch referred user info separately.
  const referredUserIds = [...new Set(referralList.map((r) => r.referredUserId))];
  const referredUsers =
    referredUserIds.length > 0
      ? await db
          .select({ id: users.id, name: users.name })
          .from(users)
      : [];

  const referredMap = new Map(referredUsers.map((u) => [u.id, u.name]));

  const serialized = referralList.map((r) => ({
    id: r.id,
    referrerName: r.referrerName || r.referrerEmail || "Unknown",
    referredName: referredMap.get(r.referredUserId) || "Unknown",
    referralCode: r.referralCode,
    rewardPoints: r.rewardPoints,
    rewardGiven: r.rewardGiven,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="Referrals" subtitle="Customer referral history" />
      <ReferralsClient referrals={serialized} />
    </>
  );
}
