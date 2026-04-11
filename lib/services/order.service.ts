import { eq, and, desc, sql } from 'drizzle-orm';
import { db, dbPool } from '@/lib/db';
import { orders, orderItems, orderStatusHistory, codCollections, courierAssignments, deliveryZones } from '@/lib/db/schema/orders';
import { carts, cartItems } from '@/lib/db/schema/cart';
import { productVariants, inventory, products } from '@/lib/db/schema/catalog';
import { addresses } from '@/lib/db/schema/users';
import { returnRequests, supportTickets } from '@/lib/db/schema/support';
import { pointsTransactions } from '@/lib/db/schema/marketing';
import { checkoutFunnel } from '@/lib/db/schema/analytics';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors/api-error';
import { generateOrderNumber } from '@/lib/utils/order-number';
import { validateCoupon, incrementCouponUsage } from '@/lib/services/coupon.service';
import { STATUS_TRANSITIONS } from '@/lib/validators/order.validators';
import type { PlaceOrderInput, AssignCourierInput, RecordCodInput } from '@/lib/validators/order.validators';
import type { PaginationParams } from '@/lib/utils/pagination';

export async function placeOrder(
  userId: string | null,
  sessionToken: string,
  input: PlaceOrderInput,
) {
  // Find active cart
  const cartCondition = userId
    ? and(eq(carts.userId, userId), eq(carts.status, 'active'))
    : and(eq(carts.sessionToken, sessionToken), eq(carts.status, 'active'));

  const [cart] = await db.select().from(carts).where(cartCondition).limit(1);
  if (!cart) throw new NotFoundError('No active cart found');

  // Get cart items
  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id));
  if (items.length === 0) throw new ValidationError('Cart is empty');

  // Create address from inline shipping data
  const addr = input.shippingAddress;
  const [address] = await db.insert(addresses).values({
    userId: userId ?? undefined,
    firstName: addr.firstName,
    lastName: addr.lastName,
    phonePk: addr.phone,
    addressLine1: addr.streetAddress,
    city: addr.city,
    province: addr.province,
    postalCode: addr.postalCode ?? null,
    isGuest: !userId,
  }).returning();

  // Verify delivery zone
  const [zone] = await db
    .select()
    .from(deliveryZones)
    .where(and(eq(deliveryZones.id, input.deliveryZoneId), eq(deliveryZones.isActive, true)))
    .limit(1);

  const shippingCharge = zone ? parseFloat(zone.shippingChargePkr) : 0;

  // Calculate subtotal from items (re-verify prices)
  let subtotal = 0;
  const orderItemsData: { variantId: string; quantity: number; unitPricePkr: string; totalPkr: string }[] = [];

  for (const item of items) {
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, item.variantId)).limit(1);
    if (!variant) throw new NotFoundError(`Variant ${item.variantId} not found`);

    const [product] = await db.select().from(products).where(eq(products.id, variant.productId)).limit(1);
    const unitPrice = parseFloat(product?.basePricePkr ?? '0') + parseFloat(variant.extraPricePkr ?? '0');
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    orderItemsData.push({
      variantId: item.variantId,
      quantity: item.quantity,
      unitPricePkr: unitPrice.toFixed(2),
      totalPkr: totalPrice.toFixed(2),
    });
  }

  // Apply coupon if provided
  let discount = 0;
  let couponId: string | null = null;
  if (input.couponCode) {
    const couponResult = await validateCoupon(input.couponCode, subtotal.toFixed(2));
    discount = parseFloat(couponResult.discountAmount);
    couponId = couponResult.couponId;
  }

  const total = subtotal + shippingCharge - discount;
  const orderNumber = generateOrderNumber();

  // Use pool for transaction
  const order = await dbPool.transaction(async (tx) => {
    // Reserve inventory for each item
    for (const item of items) {
      const result = await tx
        .update(inventory)
        .set({
          quantityReserved: sql`${inventory.quantityReserved} + ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(
          sql`${inventory.variantId} = ${item.variantId} AND ${inventory.quantityOnHand} - ${inventory.quantityReserved} >= ${item.quantity}`,
        )
        .returning();

      if (result.length === 0) {
        throw new ConflictError(`Insufficient stock for variant ${item.variantId}`);
      }
    }

    // Create order
    const [newOrder] = await tx
      .insert(orders)
      .values({
        orderNumber,
        userId: userId ?? null,
        guestPhone: !userId ? addr.phone : null,
        guestEmail: input.guestEmail ?? null,
        addressId: address.id,
        couponId,
        status: 'pending',
        subtotalPkr: subtotal.toFixed(2),
        shippingChargePkr: shippingCharge.toFixed(2),
        codChargePkr: '0.00',
        discountPkr: discount.toFixed(2),
        totalPkr: total.toFixed(2),
        customerNotes: input.customerNotes ?? null,
      })
      .returning();

    // Create order items
    await tx.insert(orderItems).values(
      orderItemsData.map((item) => ({ orderId: newOrder.id, ...item })),
    );

    // Create initial status history
    await tx.insert(orderStatusHistory).values({
      orderId: newOrder.id,
      status: 'pending',
      notes: 'Order placed',
    });

    // Create COD collection record
    await tx.insert(codCollections).values({
      orderId: newOrder.id,
      amountExpectedPkr: total.toFixed(2),
      status: 'pending',
    });

    // Mark cart as converted
    await tx.update(carts).set({ status: 'converted' }).where(eq(carts.id, cart.id));

    return newOrder;
  });

  // Increment coupon usage (outside transaction — non-critical)
  if (couponId) {
    await incrementCouponUsage(couponId);
  }

  return order;
}

export async function getOrderByNumber(orderNumber: string, userId?: string) {
  const conditions = [eq(orders.orderNumber, orderNumber)];
  if (userId) conditions.push(eq(orders.userId, userId));

  const [order] = await db.select().from(orders).where(and(...conditions)).limit(1);
  if (!order) throw new NotFoundError('Order not found');

  const [items, history, courier, cod] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id)).orderBy(desc(orderStatusHistory.createdAt)),
    db.select().from(courierAssignments).where(eq(courierAssignments.orderId, order.id)).limit(1),
    db.select().from(codCollections).where(eq(codCollections.orderId, order.id)).limit(1),
  ]);

  return { ...order, items, statusHistory: history, courier: courier[0] ?? null, cod: cod[0] ?? null };
}

export async function listUserOrders(userId: string, pagination: PaginationParams) {
  const where = eq(orders.userId, userId);

  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(orders).where(where);

  const data = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return { data, total: countResult?.count ?? 0 };
}

export async function updateOrderStatus(orderId: string, newStatus: string, adminId: string, notes?: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new NotFoundError('Order not found');

  const allowed = STATUS_TRANSITIONS[order.status];
  if (!allowed?.includes(newStatus)) {
    throw new ValidationError(`Cannot transition from '${order.status}' to '${newStatus}'`);
  }

  // If cancelling, release reserved inventory
  if (newStatus === 'cancelled') {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      await db
        .update(inventory)
        .set({
          quantityReserved: sql`GREATEST(${inventory.quantityReserved} - ${item.quantity}, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(inventory.variantId, item.variantId));
    }
  }

  const [updated] = await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  await db.insert(orderStatusHistory).values({
    orderId,
    status: newStatus,
    notes: notes ?? null,
    changedBy: adminId,
  });

  return updated;
}

export async function assignCourier(orderId: string, input: AssignCourierInput) {
  const [assignment] = await db
    .insert(courierAssignments)
    .values({
      orderId,
      courierName: input.courierName,
      trackingNumber: input.trackingNumber ?? null,
      riderName: input.riderName ?? null,
      riderPhone: input.riderPhone ?? null,
      estimatedDelivery: input.estimatedDelivery ?? null,
    })
    .returning();

  return assignment;
}

/**
 * Permanently delete an order and every dependent row.
 *
 * Refuses if any `return_requests` reference this order — refund/return
 * paperwork must not be orphaned. Releases reserved inventory for any
 * order that wasn't already cancelled (cancel transition already
 * decrements reservations). Detaches nullable references on
 * `support_tickets`, `points_transactions`, and `checkout_funnel` so
 * those analytics/support rows stay queryable after the order is gone.
 *
 * Runs inside a single pool transaction. Returns the order number for
 * caller-side messaging/logging.
 */
export async function deleteOrder(id: string): Promise<{ orderNumber: string }> {
  return dbPool.transaction(async (tx) => {
    const [order] = await tx
      .select({ id: orders.id, orderNumber: orders.orderNumber, status: orders.status })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    if (!order) throw new NotFoundError('Order not found');

    // Guardrail: refuse if any return requests reference this order.
    const [returnRef] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(returnRequests)
      .where(eq(returnRequests.orderId, id));
    if ((returnRef?.count ?? 0) > 0) {
      throw new ConflictError(
        'Cannot delete order: it has return requests. Resolve the returns first.',
      );
    }

    // Release reserved inventory unless the order was already cancelled
    // (the cancel transition in updateOrderStatus already released them).
    if (order.status !== 'cancelled') {
      const items = await tx
        .select({ variantId: orderItems.variantId, quantity: orderItems.quantity })
        .from(orderItems)
        .where(eq(orderItems.orderId, id));
      for (const item of items) {
        await tx
          .update(inventory)
          .set({
            quantityReserved: sql`GREATEST(${inventory.quantityReserved} - ${item.quantity}, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(inventory.variantId, item.variantId));
      }
    }

    // Detach nullable FKs (preserve analytics + support history).
    await tx
      .update(supportTickets)
      .set({ orderId: null })
      .where(eq(supportTickets.orderId, id));
    await tx
      .update(pointsTransactions)
      .set({ orderId: null })
      .where(eq(pointsTransactions.orderId, id));
    await tx
      .update(checkoutFunnel)
      .set({ orderId: null })
      .where(eq(checkoutFunnel.orderId, id));

    // Children with NOT NULL FKs — must go before the parent row.
    await tx.delete(courierAssignments).where(eq(courierAssignments.orderId, id));
    await tx.delete(codCollections).where(eq(codCollections.orderId, id));
    await tx.delete(orderStatusHistory).where(eq(orderStatusHistory.orderId, id));
    await tx.delete(orderItems).where(eq(orderItems.orderId, id));

    await tx.delete(orders).where(eq(orders.id, id));

    return { orderNumber: order.orderNumber };
  });
}

export async function recordCodCollection(orderId: string, adminId: string, input: RecordCodInput) {
  const [cod] = await db.select().from(codCollections).where(eq(codCollections.orderId, orderId)).limit(1);
  if (!cod) throw new NotFoundError('COD record not found');

  const collected = parseFloat(input.amountCollectedPkr);
  const expected = parseFloat(cod.amountExpectedPkr);
  const status = collected >= expected ? 'collected' : 'short_paid';

  const [updated] = await db
    .update(codCollections)
    .set({
      amountCollectedPkr: input.amountCollectedPkr,
      status,
      collectedBy: adminId,
      collectedAt: new Date(),
      remarks: input.remarks ?? null,
    })
    .where(eq(codCollections.orderId, orderId))
    .returning();

  return updated;
}
