import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrderByNumber } from '@/lib/services/order.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const { orderNumber } = await params;
    const user = await getCurrentUser();
    const order = await getOrderByNumber(orderNumber, user?.id);
    return success(order);
  } catch (error) {
    return handleApiError(error);
  }
}
