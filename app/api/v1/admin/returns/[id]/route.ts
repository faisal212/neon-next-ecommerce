import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getReturnRequest, updateReturnStatus } from '@/lib/services/return.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const request_ = await getReturnRequest(id);
    return success(request_);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(['super_admin', 'manager']);
    const { id } = await params;
    const body = await request.json();
    const updated = await updateReturnStatus(id, body.status, body.resolution, admin.id);
    return success(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
