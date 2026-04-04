import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validators/user.validators';
import { getUserById, updateUser } from '@/lib/services/user.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { ForbiddenError } from '@/lib/errors/api-error';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    if (user.id !== id) throw new ForbiddenError('Cannot view other users');
    const profile = await getUserById(id);
    return success(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    if (user.id !== id) throw new ForbiddenError('Cannot update other users');

    const body = await request.json();
    const data = updateProfileSchema.parse(body);
    const updated = await updateUser(id, data);
    return success(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
