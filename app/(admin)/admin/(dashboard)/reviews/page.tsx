import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews, products } from "@/lib/db/schema/catalog";
import { users } from "@/lib/db/schema/users";
import { PageHeader } from "../../_components/page-header";
import { ReviewsClient } from "./_components/reviews-client";

export default async function ReviewsPage() {
  const reviewList = await db
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
      userName: users.name,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .leftJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.createdAt));

  // Get published/unpublished counts
  const publishedCounts = await db
    .select({
      isPublished: reviews.isPublished,
      count: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .groupBy(reviews.isPublished);

  let publishedCount = 0;
  let unpublishedCount = 0;
  for (const pc of publishedCounts) {
    if (pc.isPublished) publishedCount = pc.count;
    else unpublishedCount = pc.count;
  }

  const serialized = reviewList.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="Reviews" subtitle="Moderate customer reviews" />
      <ReviewsClient
        reviews={serialized}
        publishedCount={publishedCount}
        unpublishedCount={unpublishedCount}
      />
    </>
  );
}
