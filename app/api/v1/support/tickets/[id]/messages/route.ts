import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getTicket, addMessage } from '@/lib/services/support-ticket.service';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { z } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;
    const ticket = await getTicket(id);
    return success(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { message } = z.object({ message: z.string().min(1) }).parse(body);
    const msg = await addMessage(id, user.id, 'customer', message);
    return created(msg);
  } catch (error) {
    return handleApiError(error);
  }
}
