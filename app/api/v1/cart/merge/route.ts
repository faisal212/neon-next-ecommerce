import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { mergeCartSchema } from '@/lib/validators/cart.validators';
import { mergeCarts } from '@/lib/services/cart.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = mergeCartSchema.parse(body);
    const result = await mergeCarts(user.id, data);
    return success(result);
  } catch (error) {
    return handleApiError(error);
  }
}
