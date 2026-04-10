import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getProductSeo, upsertProductSeo } from '@/lib/services/seo.service';
import { invalidateProductById } from '@/lib/cache/revalidate';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const seo = await getProductSeo(id);
    return success(seo);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id } = await params;
    const body = await request.json();
    const seo = await upsertProductSeo(id, body);
    await invalidateProductById(id);
    return success(seo);
  } catch (error) {
    return handleApiError(error);
  }
}
