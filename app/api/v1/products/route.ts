import { type NextRequest, connection } from 'next/server';
import { listProducts } from '@/lib/services/product.service';
import { paginated } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(request: NextRequest) {
  try {
    await connection();
    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePagination(searchParams);

    const { data, total } = await listProducts(
      {
        categorySlug: searchParams.get('category') ?? undefined,
        minPrice: searchParams.get('minPrice') ?? undefined,
        maxPrice: searchParams.get('maxPrice') ?? undefined,
        q: searchParams.get('q') ?? undefined,
        featured: searchParams.get('featured') === 'true' ? true : undefined,
      },
      pagination,
    );

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
