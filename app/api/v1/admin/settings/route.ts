import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listSettings, upsertSetting } from '@/lib/services/settings.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { z } from 'zod';

export async function GET() {
  try {
    await requireAdmin();
    const settings = await listSettings();
    return success(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(['super_admin']);
    const body = await request.json();
    const data = z.object({
      key: z.string().min(1).max(100),
      value: z.unknown(),
      description: z.string().optional(),
    }).parse(body);
    const setting = await upsertSetting(data.key, data.value, data.description, admin.id);
    return success(setting);
  } catch (error) {
    return handleApiError(error);
  }
}
