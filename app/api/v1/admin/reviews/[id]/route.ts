import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { moderateReview } from '@/lib/services/review.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const review = await moderateReview(id, body.isPublished);
    return success(review);
  } catch (error) {
    return handleApiError(error);
  }
}
