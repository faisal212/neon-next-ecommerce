import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema/orders';
import { getOrderByNumber, deleteOrder } from '@/lib/services/order.service';
import { invalidateVariantStock } from '@/lib/cache/revalidate';
import { success, noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { NotFoundError } from '@/lib/errors/api-error';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) throw new NotFoundError('Order not found');

    const full = await getOrderByNumber(order.orderNumber);
    return success(full);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Permanent order deletion is super_admin only — managers cannot
    // delete financial records.
    await requireAdmin(['super_admin']);
    const { id } = await params;

    // Capture variant ids before delete — deleteOrder also drops the
    // order_items rows. If the order wasn't already cancelled, deletion
    // will release reserved stock, so we need to flush the grids.
    const itemsBefore = await db
      .select({ variantId: orderItems.variantId })
      .from(orderItems)
      .where(eq(orderItems.orderId, id));
    const [orderBefore] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    await deleteOrder(id);

    if (orderBefore && orderBefore.status !== 'cancelled' && itemsBefore.length > 0) {
      try {
        await invalidateVariantStock(itemsBefore.map((i) => i.variantId));
      } catch (err) {
        console.error('[admin/orders] cache invalidation failed:', err);
      }
    }

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
