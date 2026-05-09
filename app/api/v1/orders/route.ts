import { type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orderItems } from '@/lib/db/schema/orders';
import { getCurrentUser } from '@/lib/auth';
import { placeOrderSchema } from '@/lib/validators/order.validators';
import { placeOrder, listUserOrders } from '@/lib/services/order.service';
import { invalidateVariantStock } from '@/lib/cache/revalidate';
import { created, paginated } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';
import { ValidationError } from '@/lib/errors/api-error';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ValidationError('Authentication required to view orders');

    const pagination = parsePagination(request.nextUrl.searchParams);
    const { data, total } = await listUserOrders(user.id, pagination);

    return paginated(data, {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionToken = request.headers.get('x-session-token') ?? '';

    const body = await request.json();
    const data = placeOrderSchema.parse(body);
    const order = await placeOrder(user?.id ?? null, sessionToken, data);

    // Reserved stock may have just dropped one or more variants to zero
    // available — flush the storefront grids so they re-render without
    // those cards on the next request. Failure here is non-fatal: the
    // order is already committed; cache eventually expires anyway.
    try {
      const items = await db
        .select({ variantId: orderItems.variantId })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      await invalidateVariantStock(items.map((i) => i.variantId));
    } catch (err) {
      console.error('[orders] cache invalidation failed:', err);
    }

    return created(order);
  } catch (error) {
    return handleApiError(error);
  }
}
