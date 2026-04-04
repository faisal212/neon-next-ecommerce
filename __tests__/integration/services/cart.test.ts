import { describe, it, expect, beforeEach } from 'vitest';
import { truncateAll } from '../../helpers/db';
import { seedUser, seedCategory, seedProduct, seedVariantWithStock, seedCartWithItems } from '../../helpers/factories';
import { getOrCreateCart, addItem, getCartWithItems, mergeCarts } from '@/lib/services/cart.service';

describe('Cart Service (integration)', () => {
  let userId: string;
  let variantId: string;
  let productId: string;

  beforeEach(async () => {
    await truncateAll();
    const user = await seedUser();
    userId = user.id;
    const category = await seedCategory();
    const product = await seedProduct(category.id, { basePricePkr: '1000.00' });
    productId = product.id;
    const variant = await seedVariantWithStock(product.id, 10);
    variantId = variant.id;
  });

  it('creates a new cart for a user', async () => {
    const cart = await getOrCreateCart(userId, `user-${userId}`);
    expect(cart.userId).toBe(userId);
    expect(cart.status).toBe('active');
  });

  it('returns existing active cart instead of creating new', async () => {
    const cart1 = await getOrCreateCart(userId, `user-${userId}`);
    const cart2 = await getOrCreateCart(userId, `user-${userId}`);
    expect(cart1.id).toBe(cart2.id);
  });

  it('creates guest cart with session token', async () => {
    const cart = await getOrCreateCart(null, 'guest-session-123');
    expect(cart.userId).toBeNull();
    expect(cart.sessionToken).toBe('guest-session-123');
  });

  it('adds item to cart with price snapshot', async () => {
    const cart = await getOrCreateCart(userId, `user-${userId}`);
    const item = await addItem(cart.id, { variantId, quantity: 2 });
    expect(item.quantity).toBe(2);
    expect(item.unitPricePkr).toBe('1000.00'); // base price snapshot
  });

  it('increments quantity when adding same variant again', async () => {
    const cart = await getOrCreateCart(userId, `user-${userId}`);
    await addItem(cart.id, { variantId, quantity: 2 });
    const item = await addItem(cart.id, { variantId, quantity: 3 });
    expect(item.quantity).toBe(5);
  });

  it('rejects when quantity exceeds available stock', async () => {
    const cart = await getOrCreateCart(userId, `user-${userId}`);
    await expect(addItem(cart.id, { variantId, quantity: 15 })).rejects.toThrow('Only 10 units available');
  });

  describe('cart merge', () => {
    it('merge_all combines quantities from both carts', async () => {
      // Guest cart: variant x 3
      const { sessionToken } = await seedCartWithItems(null, [
        { variantId, quantity: 3, unitPrice: '1000.00' },
      ]);

      // User cart: variant x 2
      await seedCartWithItems(userId, [
        { variantId, quantity: 2, unitPrice: '1000.00' },
      ]);

      const result = await mergeCarts(userId, { guestSessionToken: sessionToken, strategy: 'merge_all' });
      expect(result.merged).toBe(1);

      const cartWithItems = await getCartWithItems(result.cartId);
      const mergedItem = cartWithItems.items.find(i => i.variantId === variantId);
      expect(mergedItem?.quantity).toBe(5); // 3 + 2
    });

    it('keep_higher_qty takes the larger quantity', async () => {
      const { sessionToken } = await seedCartWithItems(null, [
        { variantId, quantity: 5, unitPrice: '1000.00' },
      ]);

      await seedCartWithItems(userId, [
        { variantId, quantity: 2, unitPrice: '1000.00' },
      ]);

      const result = await mergeCarts(userId, { guestSessionToken: sessionToken, strategy: 'keep_higher_qty' });

      const cartWithItems = await getCartWithItems(result.cartId);
      const mergedItem = cartWithItems.items.find(i => i.variantId === variantId);
      expect(mergedItem?.quantity).toBe(5); // max(5, 2)
    });

    it('keep_user_cart ignores guest items that exist in user cart', async () => {
      const { sessionToken } = await seedCartWithItems(null, [
        { variantId, quantity: 8, unitPrice: '1000.00' },
      ]);

      await seedCartWithItems(userId, [
        { variantId, quantity: 2, unitPrice: '1000.00' },
      ]);

      const result = await mergeCarts(userId, { guestSessionToken: sessionToken, strategy: 'keep_user_cart' });

      const cartWithItems = await getCartWithItems(result.cartId);
      const mergedItem = cartWithItems.items.find(i => i.variantId === variantId);
      expect(mergedItem?.quantity).toBe(2); // kept user's qty
    });

    it('adds new items from guest cart that user cart does not have', async () => {
      // Create second variant
      const variant2 = await seedVariantWithStock(productId, 10);

      const { sessionToken } = await seedCartWithItems(null, [
        { variantId: variant2.id, quantity: 3, unitPrice: '1000.00' },
      ]);

      await seedCartWithItems(userId, [
        { variantId, quantity: 2, unitPrice: '1000.00' },
      ]);

      const result = await mergeCarts(userId, { guestSessionToken: sessionToken, strategy: 'keep_user_cart' });

      const cartWithItems = await getCartWithItems(result.cartId);
      expect(cartWithItems.items.length).toBe(2); // original + new from guest
    });
  });
});
