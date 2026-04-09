import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listAllTickets } from '@/lib/services/support-ticket.service';
import { paginated } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePagination(searchParams);
    const status = searchParams.get('status') ?? undefined;
    const priority = searchParams.get('priority') ?? undefined;
    const { data, total } = await listAllTickets(pagination, status, priority);

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
