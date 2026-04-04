import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { addressSchema } from '@/lib/validators/user.validators';
import { listAddresses, createAddress } from '@/lib/services/address.service';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { ForbiddenError } from '@/lib/errors/api-error';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    if (user.id !== id) throw new ForbiddenError('Cannot view other users\' addresses');
    const addrs = await listAddresses(id);
    return success(addrs);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    if (user.id !== id) throw new ForbiddenError('Cannot add addresses for other users');

    const body = await request.json();
    const data = addressSchema.parse(body);
    const address = await createAddress(id, data);
    return created(address);
  } catch (error) {
    return handleApiError(error);
  }
}
