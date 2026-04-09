import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminUserById, updateAdminUser } from '@/lib/services/admin-user.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const admin = await getAdminUserById(id);
    return success(admin);
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
    const admin = await updateAdminUser(id, {
      role: body.role,
      isActive: body.isActive,
    });
    return success(admin);
  } catch (error) {
    return handleApiError(error);
  }
}
