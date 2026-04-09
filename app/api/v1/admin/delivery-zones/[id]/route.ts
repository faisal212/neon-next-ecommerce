import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateZone, deleteZone } from '@/lib/services/delivery-zone.service';
import { success, noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id } = await params;
    const body = await request.json();
    const zone = await updateZone(id, body);
    return success(zone);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id } = await params;
    await deleteZone(id);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
