import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { loyaltyPoints, pointsTransactions } from '@/lib/db/schema/marketing';
import { users } from '@/lib/db/schema/users';
import { NotFoundError, ValidationError } from '@/lib/errors/api-error';
import type { PaginationParams } from '@/lib/utils/pagination';

export async function getBalance(userId: string) {
  const [points] = await db.select().from(loyaltyPoints).where(eq(loyaltyPoints.userId, userId)).limit(1);
  if (!points) {
    // Auto-create balance record
    const [created] = await db.insert(loyaltyPoints).values({ userId }).returning();
    return created;
  }
  return points;
}

export async function earnPoints(userId: string, orderId: string, orderTotal: number) {
  const pointsEarned = Math.floor(orderTotal / 100); // 1 point per 100 PKR
  if (pointsEarned <= 0) return;

  await getBalance(userId); // ensure record exists

  await db.update(loyaltyPoints).set({
    totalEarned: sql`${loyaltyPoints.totalEarned} + ${pointsEarned}`,
    balance: sql`${loyaltyPoints.balance} + ${pointsEarned}`,
    updatedAt: new Date(),
  }).where(eq(loyaltyPoints.userId, userId));

  await db.insert(pointsTransactions).values({
    userId,
    orderId,
    type: 'earn',
    points: pointsEarned,
    description: `Earned from order (Rs. ${orderTotal})`,
  });

  return pointsEarned;
}

export async function redeemPoints(userId: string, points: number, description: string) {
  const balance = await getBalance(userId);
  if (balance.balance < points) {
    throw new ValidationError(`Insufficient points. Balance: ${balance.balance}`);
  }

  await db.update(loyaltyPoints).set({
    totalRedeemed: sql`${loyaltyPoints.totalRedeemed} + ${points}`,
    balance: sql`${loyaltyPoints.balance} - ${points}`,
    updatedAt: new Date(),
  }).where(eq(loyaltyPoints.userId, userId));

  await db.insert(pointsTransactions).values({
    userId,
    type: 'redeem',
    points: -points,
    description,
  });
}

export async function getPointsHistory(userId: string, pagination: PaginationParams) {
  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(pointsTransactions).where(eq(pointsTransactions.userId, userId));
  const data = await db.select().from(pointsTransactions).where(eq(pointsTransactions.userId, userId)).orderBy(desc(pointsTransactions.createdAt)).limit(pagination.limit).offset(pagination.offset);
  return { data, total: countResult?.count ?? 0 };
}

export async function listAllPointsBalances(pagination: PaginationParams) {
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loyaltyPoints);

  const data = await db
    .select({
      id: loyaltyPoints.id,
      userId: loyaltyPoints.userId,
      totalEarned: loyaltyPoints.totalEarned,
      totalRedeemed: loyaltyPoints.totalRedeemed,
      balance: loyaltyPoints.balance,
      updatedAt: loyaltyPoints.updatedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(loyaltyPoints)
    .leftJoin(users, eq(loyaltyPoints.userId, users.id))
    .orderBy(desc(loyaltyPoints.updatedAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return { data, total: countResult?.count ?? 0 };
}

export async function adjustPoints(userId: string, points: number, description: string) {
  await getBalance(userId); // ensure record exists

  if (points > 0) {
    // Credit
    await db.update(loyaltyPoints).set({
      totalEarned: sql`${loyaltyPoints.totalEarned} + ${points}`,
      balance: sql`${loyaltyPoints.balance} + ${points}`,
      updatedAt: new Date(),
    }).where(eq(loyaltyPoints.userId, userId));
  } else if (points < 0) {
    // Debit — verify sufficient balance
    const balance = await getBalance(userId);
    if (balance.balance < Math.abs(points)) {
      throw new ValidationError(`Insufficient points. Balance: ${balance.balance}`);
    }

    await db.update(loyaltyPoints).set({
      totalRedeemed: sql`${loyaltyPoints.totalRedeemed} + ${Math.abs(points)}`,
      balance: sql`${loyaltyPoints.balance} - ${Math.abs(points)}`,
      updatedAt: new Date(),
    }).where(eq(loyaltyPoints.userId, userId));
  }

  await db.insert(pointsTransactions).values({
    userId,
    type: points > 0 ? 'adjust_credit' : 'adjust_debit',
    points,
    description,
  });
}
