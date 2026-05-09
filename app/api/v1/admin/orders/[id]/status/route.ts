import { type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orderItems } from '@/lib/db/schema/orders';
import { requireAdmin } from '@/lib/auth';
import { updateOrderStatusSchema } from '@/lib/validators/order.validators';
import { updateOrderStatus } from '@/lib/services/order.service';
import { invalidateVariantStock } from '@/lib/cache/revalidate';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = updateOrderStatusSchema.parse(body);
    const order = await updateOrderStatus(id, data.status, admin.id, data.notes);

    // Cancel transition releases reserved stock — variants may flip back
    // into-stock and re-appear on grids. Other transitions don't touch
    // inventory, so skip the flush.
    if (data.status === 'cancelled') {
      try {
        const items = await db
          .select({ variantId: orderItems.variantId })
          .from(orderItems)
          .where(eq(orderItems.orderId, id));
        await invalidateVariantStock(items.map((i) => i.variantId));
      } catch (err) {
        console.error('[admin/orders/status] cache invalidation failed:', err);
      }
    }

    return success(order);
  } catch (error) {
    return handleApiError(error);
  }
}
