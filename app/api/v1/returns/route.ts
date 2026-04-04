import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createReturnRequest, listUserReturns } from '@/lib/services/return.service';
import { created, paginated } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';
import { z } from 'zod';

const returnRequestSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.enum(['wrong_item', 'damaged', 'not_as_described', 'changed_mind']),
  description: z.string().max(500).optional(),
  items: z.array(z.object({
    orderItemId: z.string().uuid(),
    quantity: z.number().int().min(1),
    condition: z.enum(['unopened', 'opened', 'damaged']),
  })).min(1),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const pagination = parsePagination(request.nextUrl.searchParams);
    const { data, total } = await listUserReturns(user.id, pagination);
    return paginated(data, { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = returnRequestSchema.parse(body);
    const returnReq = await createReturnRequest(user.id, data);
    return created(returnReq);
  } catch (error) {
    return handleApiError(error);
  }
}
