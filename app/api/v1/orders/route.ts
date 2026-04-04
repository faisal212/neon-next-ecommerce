import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { placeOrderSchema } from '@/lib/validators/order.validators';
import { placeOrder, listUserOrders } from '@/lib/services/order.service';
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
    return created(order);
  } catch (error) {
    return handleApiError(error);
  }
}
