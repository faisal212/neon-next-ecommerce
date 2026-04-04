import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { wishlists, wishlistItems } from '@/lib/db/schema/marketing';
import { NotFoundError } from '@/lib/errors/api-error';

export async function getOrCreateWishlist(userId: string) {
  const [existing] = await db.select().from(wishlists).where(eq(wishlists.userId, userId)).limit(1);
  if (existing) return existing;

  const [wishlist] = await db.insert(wishlists).values({ userId, name: 'My Wishlist' }).returning();
  return wishlist;
}

export async function getWishlistWithItems(userId: string) {
  const wishlist = await getOrCreateWishlist(userId);
  const items = await db.select().from(wishlistItems).where(eq(wishlistItems.wishlistId, wishlist.id));
  return { ...wishlist, items };
}

export async function addToWishlist(userId: string, variantId: string) {
  const wishlist = await getOrCreateWishlist(userId);

  // Idempotent — skip if already added
  const [existing] = await db.select().from(wishlistItems)
    .where(and(eq(wishlistItems.wishlistId, wishlist.id), eq(wishlistItems.variantId, variantId)))
    .limit(1);

  if (existing) return existing;

  const [item] = await db.insert(wishlistItems).values({ wishlistId: wishlist.id, variantId }).returning();
  return item;
}

export async function removeFromWishlist(userId: string, itemId: string) {
  const wishlist = await getOrCreateWishlist(userId);
  const [item] = await db.delete(wishlistItems)
    .where(and(eq(wishlistItems.id, itemId), eq(wishlistItems.wishlistId, wishlist.id)))
    .returning();

  if (!item) throw new NotFoundError('Wishlist item not found');
  return item;
}
