import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { addCartItemSchema } from '@/lib/validators/cart.validators';
import { getOrCreateCart, addItem } from '@/lib/services/cart.service';
import { created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { ValidationError } from '@/lib/errors/api-error';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionToken = request.headers.get('x-session-token');

    if (!user && !sessionToken) {
      throw new ValidationError('Session token required for guest cart');
    }

    const cart = await getOrCreateCart(user?.id ?? null, sessionToken ?? `user-${user!.id}`);
    const body = await request.json();
    const data = addCartItemSchema.parse(body);
    const item = await addItem(cart.id, data);
    return created(item);
  } catch (error) {
    return handleApiError(error);
  }
}
