import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createTicket, listUserTickets } from '@/lib/services/support-ticket.service';
import { success, created, paginated } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';
import { z } from 'zod';

const createTicketSchema = z.object({
  orderId: z.string().uuid().optional(),
  category: z.enum(['order_issue', 'payment', 'return', 'product', 'other']),
  subject: z.string().min(1).max(200),
  message: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const pagination = parsePagination(request.nextUrl.searchParams);
    const { data, total } = await listUserTickets(user.id, pagination);
    return paginated(data, { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = createTicketSchema.parse(body);
    const ticket = await createTicket(user.id, data);
    return created(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}
