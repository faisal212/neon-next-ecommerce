import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listAllPointsBalances } from '@/lib/services/loyalty.service';
import { paginated } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const pagination = parsePagination(request.nextUrl.searchParams);
    const { data, total } = await listAllPointsBalances(pagination);

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
