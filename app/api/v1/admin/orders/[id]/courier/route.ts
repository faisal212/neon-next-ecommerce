import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { assignCourierSchema } from '@/lib/validators/order.validators';
import { assignCourier } from '@/lib/services/order.service';
import { created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = assignCourierSchema.parse(body);
    const assignment = await assignCourier(id, data);
    return created(assignment);
  } catch (error) {
    return handleApiError(error);
  }
}
