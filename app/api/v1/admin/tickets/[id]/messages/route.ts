import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { addMessage } from '@/lib/services/support-ticket.service';
import { created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const msg = await addMessage(id, admin.id, 'admin', body.message);
    return created(msg);
  } catch (error) {
    return handleApiError(error);
  }
}
