import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getWishlistWithItems, addToWishlist } from '@/lib/services/wishlist.service';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { z } from 'zod';

export async function GET() {
  try {
    const user = await requireAuth();
    const wishlist = await getWishlistWithItems(user.id);
    return success(wishlist);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { variantId } = z.object({ variantId: z.string().uuid() }).parse(body);
    const item = await addToWishlist(user.id, variantId);
    return created(item);
  } catch (error) {
    return handleApiError(error);
  }
}
