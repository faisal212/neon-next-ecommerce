import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getTemplate, updateTemplate } from '@/lib/services/notification-template.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const template = await getTemplate(id);
    return success(template);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin']);
    const { id } = await params;
    const body = await request.json();
    const template = await updateTemplate(id, body);
    return success(template);
  } catch (error) {
    return handleApiError(error);
  }
}
