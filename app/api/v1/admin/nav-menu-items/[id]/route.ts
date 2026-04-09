import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  getNavMenuItemById,
  updateNavMenuItem,
  deleteNavMenuItem,
} from '@/lib/services/nav-menu.service';
import { success, noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const item = await getNavMenuItemById(id);
    return success(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id } = await params;
    const body = await request.json();
    const item = await updateNavMenuItem(id, body);
    return success(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id } = await params;
    await deleteNavMenuItem(id);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
