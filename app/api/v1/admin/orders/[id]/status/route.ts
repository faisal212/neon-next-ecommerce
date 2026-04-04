import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateOrderStatusSchema } from '@/lib/validators/order.validators';
import { updateOrderStatus } from '@/lib/services/order.service';
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
    return success(order);
  } catch (error) {
    return handleApiError(error);
  }
}
