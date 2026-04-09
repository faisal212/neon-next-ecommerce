import { requireAdmin } from '@/lib/auth';
import { listAdminUsers } from '@/lib/services/admin-user.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    await requireAdmin(['super_admin']);
    const admins = await listAdminUsers();
    return success(admins);
  } catch (error) {
    return handleApiError(error);
  }
}
