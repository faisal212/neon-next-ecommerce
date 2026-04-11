import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { reviews, products } from '@/lib/db/schema/catalog';
import { orderItems } from '@/lib/db/schema/orders';
import { users } from '@/lib/db/schema/users';
import { ForbiddenError, ConflictError, NotFoundError } from '@/lib/errors/api-error';
import type { CreateReviewInput } from '@/lib/validators/product.validators';
import type { PaginationParams } from '@/lib/utils/pagination';

export async function listProductReviews(productId: string, pagination: PaginationParams) {
  const where = and(
    eq(reviews.productId, productId),
    eq(reviews.isPublished, true),
  );

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(where);

  const data = await db
    .select()
    .from(reviews)
    .where(where)
    .orderBy(desc(reviews.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return {
    data,
    total: countResult?.count ?? 0,
  };
}

export async function createReview(userId: string, productId: string, input: CreateReviewInput) {
  // Verify the user actually bought this product via this order item
  const [item] = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.id, input.orderItemId))
    .limit(1);

  if (!item) throw new NotFoundError('Order item not found');

  // Check for duplicate review on same order item
  const [existingReview] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        eq(reviews.orderItemId, input.orderItemId),
      ),
    )
    .limit(1);

  if (existingReview) throw new ConflictError('You already reviewed this item');

  const [review] = await db
    .insert(reviews)
    .values({
      userId,
      productId,
      orderItemId: input.orderItemId,
      rating: input.rating,
      comment: input.comment ?? null,
      isPublished: true,
    })
    .returning();

  return review;
}

export async function listAllReviews(pagination: PaginationParams, publishedFilter?: boolean) {
  const conditions = [];

  if (publishedFilter !== undefined) {
    conditions.push(eq(reviews.isPublished, publishedFilter));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(where);

  const data = await db
    .select({
      id: reviews.id,
      userId: reviews.userId,
      productId: reviews.productId,
      orderItemId: reviews.orderItemId,
      rating: reviews.rating,
      comment: reviews.comment,
      isPublished: reviews.isPublished,
      createdAt: reviews.createdAt,
      productName: products.nameEn,
      userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as('user_name'),
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(where)
    .orderBy(desc(reviews.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return { data, total: countResult?.count ?? 0 };
}

export async function moderateReview(reviewId: string, isPublished: boolean) {
  const [review] = await db
    .update(reviews)
    .set({ isPublished })
    .where(eq(reviews.id, reviewId))
    .returning();

  if (!review) throw new NotFoundError('Review not found');
  return review;
}
