import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { addressSchema } from '@/lib/validators/user.validators';
import { updateAddress, deleteAddress } from '@/lib/services/address.service';
import { success, noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { ForbiddenError } from '@/lib/errors/api-error';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> },
) {
  try {
    const { id, addressId } = await params;
    const user = await requireAuth();
    if (user.id !== id) throw new ForbiddenError('Cannot update other users\' addresses');

    const body = await request.json();
    const data = addressSchema.partial().parse(body);
    const address = await updateAddress(addressId, id, data);
    return success(address);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> },
) {
  try {
    const { id, addressId } = await params;
    const user = await requireAuth();
    if (user.id !== id) throw new ForbiddenError('Cannot delete other users\' addresses');

    await deleteAddress(addressId, id);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
