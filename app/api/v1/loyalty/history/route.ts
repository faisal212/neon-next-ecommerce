import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPointsHistory } from '@/lib/services/loyalty.service';
import { paginated } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const pagination = parsePagination(request.nextUrl.searchParams);
    const { data, total } = await getPointsHistory(user.id, pagination);
    return paginated(data, { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) });
  } catch (error) {
    return handleApiError(error);
  }
}
