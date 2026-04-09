import { requireAdmin } from '@/lib/auth';
import { listTemplates } from '@/lib/services/notification-template.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    await requireAdmin(['super_admin']);
    const templates = await listTemplates();
    return success(templates);
  } catch (error) {
    return handleApiError(error);
  }
}
