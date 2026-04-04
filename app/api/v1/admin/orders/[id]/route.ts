import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema/orders';
import { getOrderByNumber } from '@/lib/services/order.service';
import { success } from '@/lib/utils/api-response';
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
