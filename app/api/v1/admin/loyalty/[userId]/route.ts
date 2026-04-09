import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getBalance, adjustPoints } from '@/lib/services/loyalty.service';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    await requireAdmin();
    const { userId } = await params;
    const balance = await getBalance(userId);
    return success(balance);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { userId } = await params;
    const body = await request.json();
    await adjustPoints(userId, body.points, body.description);
    const balance = await getBalance(userId);
    return created(balance);
  } catch (error) {
    return handleApiError(error);
  }
}
