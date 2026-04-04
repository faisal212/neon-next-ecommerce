import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { removeFromWishlist } from '@/lib/services/wishlist.service';
import { noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const user = await requireAuth();
    const { itemId } = await params;
    await removeFromWishlist(user.id, itemId);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
