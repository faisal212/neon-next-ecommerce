import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getCategorySeo, upsertCategorySeo } from '@/lib/services/seo.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const seo = await getCategorySeo(id);
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
    const seo = await upsertCategorySeo(id, body);
    return success(seo);
  } catch (error) {
    return handleApiError(error);
  }
}
