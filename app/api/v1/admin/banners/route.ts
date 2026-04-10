import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listAllBanners, createBanner } from '@/lib/services/banner.service';
import { invalidateHomepage } from '@/lib/cache/revalidate';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    await requireAdmin();
    const banners = await listAllBanners();
    return success(banners);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const body = await request.json();
    const banner = await createBanner(body);
    invalidateHomepage();
    return created(banner);
  } catch (error) {
    return handleApiError(error);
  }
}
