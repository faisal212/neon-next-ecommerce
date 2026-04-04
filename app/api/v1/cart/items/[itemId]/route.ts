import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateCartItemSchema } from '@/lib/validators/cart.validators';
import { getOrCreateCart, updateItemQuantity, removeItem } from '@/lib/services/cart.service';
import { success, noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { ValidationError } from '@/lib/errors/api-error';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;
    const user = await getCurrentUser();
    const sessionToken = request.headers.get('x-session-token');

    if (!user && !sessionToken) {
      throw new ValidationError('Session token required');
    }

    const cart = await getOrCreateCart(user?.id ?? null, sessionToken ?? `user-${user!.id}`);
    const body = await request.json();
    const data = updateCartItemSchema.parse(body);
    const item = await updateItemQuantity(itemId, cart.id, data.quantity);
    return success(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;
    const user = await getCurrentUser();
    const sessionToken = request.headers.get('x-session-token');

    if (!user && !sessionToken) {
      throw new ValidationError('Session token required');
    }

    const cart = await getOrCreateCart(user?.id ?? null, sessionToken ?? `user-${user!.id}`);
    await removeItem(itemId, cart.id);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
