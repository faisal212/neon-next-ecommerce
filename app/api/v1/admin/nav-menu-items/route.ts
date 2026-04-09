import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listNavMenuItems, createNavMenuItem } from '@/lib/services/nav-menu.service';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    await requireAdmin();
    const items = await listNavMenuItems();
    return success(items);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const body = await request.json();
    const item = await createNavMenuItem(body);
    return created(item);
  } catch (error) {
    return handleApiError(error);
  }
}
