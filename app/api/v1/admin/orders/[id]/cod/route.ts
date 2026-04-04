import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { recordCodSchema } from '@/lib/validators/order.validators';
import { recordCodCollection } from '@/lib/services/order.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = recordCodSchema.parse(body);
    const cod = await recordCodCollection(id, admin.id, data);
    return success(cod);
  } catch (error) {
    return handleApiError(error);
  }
}
