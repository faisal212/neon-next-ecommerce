import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { getOrCreateCart, getCartWithItems } from '@/lib/services/cart.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { ValidationError } from '@/lib/errors/api-error';

// Neon Auth prefixes every cookie with this; absence means the visitor is
// definitely not logged in, so we can skip the ~1s getSession round-trip.
const NEON_AUTH_COOKIE_PREFIX = '__Secure-neon-auth';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-session-token');
    const cookieStore = await cookies();
    const hasAuthCookie = cookieStore
      .getAll()
      .some((c) => c.name.startsWith(NEON_AUTH_COOKIE_PREFIX));

    // Brand-new guest: no saved guest cart, not logged in. Nothing to fetch.
    // Returning an empty shell here skips getCurrentUser() entirely, which
    // otherwise costs ~1.3s on every homepage hydration and kept PSI/Lantern
    // from ever reaching a network-quiet LCP event.
    if (!sessionToken && !hasAuthCookie) {
      return success({ items: [] });
    }

    const user = hasAuthCookie ? await getCurrentUser() : null;

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
