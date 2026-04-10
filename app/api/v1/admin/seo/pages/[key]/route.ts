import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getStaticPageSeo, upsertStaticPageSeo } from '@/lib/services/seo.service';
import { invalidateStaticPage } from '@/lib/cache/revalidate';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    await requireAdmin();
    const { key } = await params;
    const seo = await getStaticPageSeo(key);
    return success(seo);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { key } = await params;
    const body = await request.json();
    const seo = await upsertStaticPageSeo(key, body);
    invalidateStaticPage(key);
    return success(seo);
  } catch (error) {
    return handleApiError(error);
  }
}
