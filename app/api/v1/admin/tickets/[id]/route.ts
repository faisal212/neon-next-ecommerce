import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getTicket, updateTicketStatus } from '@/lib/services/support-ticket.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const ticket = await getTicket(id);
    return success(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const ticket = await updateTicketStatus(id, body.status, body.assignedTo);
    return success(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}
