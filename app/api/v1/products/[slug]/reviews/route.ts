import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getProductBySlug } from '@/lib/services/product.service';
import { listProductReviews, createReview } from '@/lib/services/review.service';
import { createReviewSchema } from '@/lib/validators/product.validators';
import { success, created, paginated } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    const pagination = parsePagination(request.nextUrl.searchParams);
    const { data, total } = await listProductReviews(product.id, pagination);

    return paginated(data, {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const user = await requireAuth();
    const product = await getProductBySlug(slug);

    const body = await request.json();
    const data = createReviewSchema.parse(body);
    const review = await createReview(user.id, product.id, data);
    return created(review);
  } catch (error) {
    return handleApiError(error);
  }
}
