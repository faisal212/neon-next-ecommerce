import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getBannerById, updateBanner, deleteBanner } from '@/lib/services/banner.service';
import { invalidateHomepage } from '@/lib/cache/revalidate';
import { success, noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const banner = await getBannerById(id);
    return success(banner);
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
    const banner = await updateBanner(id, body);
    invalidateHomepage();
    return success(banner);
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
    await deleteBanner(id);
    invalidateHomepage();
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
