import { describe, it, expect, beforeEach } from 'vitest';
import { truncateAll } from '../../helpers/db';
import { seedUser, seedCategory, seedProduct, seedVariantWithStock, seedAddress, seedOrder } from '../../helpers/factories';
import { getOrCreateWishlist, getWishlistWithItems, addToWishlist, removeFromWishlist } from '@/lib/services/wishlist.service';
import { getBalance, earnPoints, redeemPoints, getPointsHistory } from '@/lib/services/loyalty.service';

describe('Wishlist Service (integration)', () => {
  let userId: string;
  let variantId: string;

  beforeEach(async () => {
    await truncateAll();
    const user = await seedUser();
    userId = user.id;
    const cat = await seedCategory();
    const product = await seedProduct(cat.id);
    const variant = await seedVariantWithStock(product.id);
    variantId = variant.id;
  });

  it('auto-creates wishlist on first access', async () => {
    const wishlist = await getOrCreateWishlist(userId);
    expect(wishlist.name).toBe('My Wishlist');
    expect(wishlist.userId).toBe(userId);
  });

  it('returns same wishlist on second access', async () => {
    const w1 = await getOrCreateWishlist(userId);
    const w2 = await getOrCreateWishlist(userId);
    expect(w1.id).toBe(w2.id);
  });

  it('adds item to wishlist', async () => {
    const item = await addToWishlist(userId, variantId);
    expect(item.variantId).toBe(variantId);
  });

  it('adding same variant twice is idempotent', async () => {
    const item1 = await addToWishlist(userId, variantId);
    const item2 = await addToWishlist(userId, variantId);
    expect(item1.id).toBe(item2.id);
  });

  it('gets wishlist with items', async () => {
    await addToWishlist(userId, variantId);
    const wishlist = await getWishlistWithItems(userId);
    expect(wishlist.items).toHaveLength(1);
  });

  it('removes item from wishlist', async () => {
    const item = await addToWishlist(userId, variantId);
    await removeFromWishlist(userId, item.id);
    const wishlist = await getWishlistWithItems(userId);
    expect(wishlist.items).toHaveLength(0);
  });
});

describe('Loyalty Service (integration)', () => {
  let userId: string;
  let orderId: string;

  beforeEach(async () => {
    await truncateAll();
    const user = await seedUser();
    userId = user.id;
    const address = await seedAddress(userId);
    const order = await seedOrder(userId, address.id);
    orderId = order.id;
  });

  it('auto-creates balance record with 0 points', async () => {
    const balance = await getBalance(userId);
    expect(balance.balance).toBe(0);
    expect(balance.totalEarned).toBe(0);
  });

  it('earns points based on order total (1 per 100 PKR)', async () => {
    const earned = await earnPoints(userId, orderId, 2500);
    expect(earned).toBe(25); // 2500 / 100

    const balance = await getBalance(userId);
    expect(balance.balance).toBe(25);
    expect(balance.totalEarned).toBe(25);
  });

  it('accumulates points across orders', async () => {
    await earnPoints(userId, orderId, 1000);
    await earnPoints(userId, orderId, 3000);

    const balance = await getBalance(userId);
    expect(balance.balance).toBe(40); // 10 + 30
  });

  it('redeems points and reduces balance', async () => {
    await earnPoints(userId, orderId, 5000);
    await redeemPoints(userId, 20, 'Discount on order');

    const balance = await getBalance(userId);
    expect(balance.balance).toBe(30); // 50 - 20
    expect(balance.totalRedeemed).toBe(20);
  });

  it('rejects redemption exceeding balance', async () => {
    await earnPoints(userId, orderId, 1000);
    await expect(redeemPoints(userId, 100, 'Too much')).rejects.toThrow('Insufficient points');
  });

  it('tracks points history', async () => {
    await earnPoints(userId, orderId, 2000);
    await redeemPoints(userId, 5, 'Small discount');

    const { data, total } = await getPointsHistory(userId, { page: 1, limit: 10, offset: 0 });
    expect(total).toBe(2);
    expect(data[0].type).toBe('redeem'); // most recent first
    expect(data[1].type).toBe('earn');
  });
});
