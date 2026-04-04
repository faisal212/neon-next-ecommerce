import { requireAuth } from '@/lib/auth';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    const user = await requireAuth();
    return success(user);
  } catch (error) {
    return handleApiError(error);
  }
}
