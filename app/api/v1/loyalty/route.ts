import { requireAuth } from '@/lib/auth';
import { getBalance } from '@/lib/services/loyalty.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    const user = await requireAuth();
    const balance = await getBalance(user.id);
    return success(balance);
  } catch (error) {
    return handleApiError(error);
  }
}
