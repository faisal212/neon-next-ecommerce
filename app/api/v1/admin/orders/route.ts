import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema/orders';
import { paginated } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePagination(searchParams);
    const status = searchParams.get('status');

    const conditions = [];
    if (status) conditions.push(eq(orders.status, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(orders).where(where);
    const data = await db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(pagination.limit).offset(pagination.offset);

    return paginated(data, {
      page: pagination.page,
      limit: pagination.limit,
      total: countResult?.count ?? 0,
      totalPages: Math.ceil((countResult?.count ?? 0) / pagination.limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
