import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrCreateCart, getCartWithItems } from '@/lib/services/cart.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { ValidationError } from '@/lib/errors/api-error';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionToken = request.headers.get('x-session-token');

    if (!user && !sessionToken) {
      throw new ValidationError('Session token required for guest cart');
    }

    const cart = await getOrCreateCart(user?.id ?? null, sessionToken ?? `user-${user!.id}`);
    const cartWithItems = await getCartWithItems(cart.id);
    return success(cartWithItems);
  } catch (error) {
    return handleApiError(error);
  }
}
