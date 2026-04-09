import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { carts, cartItems, cartMergeLog } from '@/lib/db/schema/cart';
import { productVariants, inventory, products, productImages } from '@/lib/db/schema/catalog';
import { NotFoundError, ConflictError } from '@/lib/errors/api-error';
import type { AddCartItemInput, MergeCartInput } from '@/lib/validators/cart.validators';

function guestExpiresAt() {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
}

function userExpiresAt() {
  return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
}

export async function getOrCreateCart(userId: string | null, sessionToken: string) {
  // Try to find existing active cart
  const condition = userId
    ? and(eq(carts.userId, userId), eq(carts.status, 'active'))
    : and(eq(carts.sessionToken, sessionToken), eq(carts.status, 'active'));

  const [existing] = await db.select().from(carts).where(condition).limit(1);

  if (existing) {
    // Check expiry
    if (existing.expiresAt && new Date(existing.expiresAt) < new Date()) {
      await db.update(carts).set({ status: 'abandoned' }).where(eq(carts.id, existing.id));
    } else {
      return existing;
    }
  }

  // Create new cart
  const [cart] = await db
    .insert(carts)
    .values({
      userId: userId ?? null,
      sessionToken,
      status: 'active',
      expiresAt: userId ? userExpiresAt() : guestExpiresAt(),
    })
    .returning();

  return cart;
}

export async function getCartWithItems(cartId: string) {
  const [cart] = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);
  if (!cart) throw new NotFoundError('Cart not found');

  const rawItems = await db
    .select({
      id: cartItems.id,
      cartId: cartItems.cartId,
      variantId: cartItems.variantId,
      quantity: cartItems.quantity,
      unitPricePkr: cartItems.unitPricePkr,
      addedAt: cartItems.addedAt,
      sku: productVariants.sku,
      color: productVariants.color,
      size: productVariants.size,
      productId: productVariants.productId,
      productName: products.nameEn,
      productSlug: products.slug,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

  // Fetch primary image for each product
  const items = await Promise.all(
    rawItems.map(async (item) => {
      const [img] = await db
        .select({ url: productImages.url, altText: productImages.altText })
        .from(productImages)
        .where(eq(productImages.productId, item.productId))
        .orderBy(productImages.sortOrder)
        .limit(1);
      return { ...item, imageUrl: img?.url ?? null };
    }),
  );

  return { ...cart, items };
}

export async function addItem(cartId: string, input: AddCartItemInput) {
  // Check variant exists and is active
  const [variant] = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.id, input.variantId), eq(productVariants.isActive, true)))
    .limit(1);

  if (!variant) throw new NotFoundError('Variant not found or inactive');

  // Check stock availability
  const [inv] = await db
    .select()
    .from(inventory)
    .where(eq(inventory.variantId, input.variantId))
    .limit(1);

  const available = inv ? inv.quantityOnHand - inv.quantityReserved : 0;
  if (available < input.quantity) {
    throw new ConflictError(`Only ${available} units available`);
  }

  // Get current price (base + extra)
  const [product] = await db
    .select({ basePricePkr: products.basePricePkr })
    .from(products)
    .where(eq(products.id, variant.productId))
    .limit(1);

  const unitPrice = (
    parseFloat(product?.basePricePkr ?? '0') + parseFloat(variant.extraPricePkr ?? '0')
  ).toFixed(2);

  // Check if variant already in cart
  const [existingItem] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, input.variantId)))
    .limit(1);

  if (existingItem) {
    const newQty = existingItem.quantity + input.quantity;
    if (newQty > available) {
      throw new ConflictError(`Only ${available} units available`);
    }

    const [updated] = await db
      .update(cartItems)
      .set({ quantity: newQty, updatedAt: new Date() })
      .where(eq(cartItems.id, existingItem.id))
      .returning();

    return updated;
  }

  const [item] = await db
    .insert(cartItems)
    .values({
      cartId,
      variantId: input.variantId,
      quantity: input.quantity,
      unitPricePkr: unitPrice,
    })
    .returning();

  return item;
}

export async function updateItemQuantity(itemId: string, cartId: string, quantity: number) {
  const [item] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
    .limit(1);

  if (!item) throw new NotFoundError('Cart item not found');

  // Check stock
  const [inv] = await db
    .select()
    .from(inventory)
    .where(eq(inventory.variantId, item.variantId))
    .limit(1);

  const available = inv ? inv.quantityOnHand - inv.quantityReserved : 0;
  if (quantity > available) {
    throw new ConflictError(`Only ${available} units available`);
  }

  const [updated] = await db
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(cartItems.id, itemId))
    .returning();

  return updated;
}

export async function removeItem(itemId: string, cartId: string) {
  const [item] = await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
    .returning();

  if (!item) throw new NotFoundError('Cart item not found');
  return item;
}

export async function mergeCarts(userId: string, input: MergeCartInput) {
  // Find guest cart
  const [guestCart] = await db
    .select()
    .from(carts)
    .where(and(eq(carts.sessionToken, input.guestSessionToken), eq(carts.status, 'active')))
    .limit(1);

  if (!guestCart) throw new NotFoundError('Guest cart not found');

  // Get or create user cart
  const userCart = await getOrCreateCart(userId, `user-${userId}`);

  const guestItems = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, guestCart.id));

  if (guestItems.length === 0) {
    return { merged: 0, cartId: userCart.id };
  }

  const userItems = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, userCart.id));

  const userItemMap = new Map(userItems.map((i) => [i.variantId, i]));
  let itemsMerged = 0;

  for (const guestItem of guestItems) {
    const userItem = userItemMap.get(guestItem.variantId);

    if (input.strategy === 'keep_user_cart' && userItem) {
      continue; // Skip guest items that exist in user cart
    }

    if (userItem) {
      const qty =
        input.strategy === 'keep_higher_qty'
          ? Math.max(guestItem.quantity, userItem.quantity)
          : guestItem.quantity + userItem.quantity;

      await db
        .update(cartItems)
        .set({ quantity: qty, updatedAt: new Date() })
        .where(eq(cartItems.id, userItem.id));
    } else {
      await db.insert(cartItems).values({
        cartId: userCart.id,
        variantId: guestItem.variantId,
        quantity: guestItem.quantity,
        unitPricePkr: guestItem.unitPricePkr,
      });
    }
    itemsMerged++;
  }

  // Mark guest cart as merged
  await db.update(carts).set({ status: 'merged' }).where(eq(carts.id, guestCart.id));

  // Log the merge
  await db.insert(cartMergeLog).values({
    guestCartId: guestCart.id,
    userCartId: userCart.id,
    itemsMerged,
    strategy: input.strategy,
  });

  return { merged: itemsMerged, cartId: userCart.id };
}
