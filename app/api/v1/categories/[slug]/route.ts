import { type NextRequest } from 'next/server';
import { getCategoryBySlug } from '@/lib/services/category.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    return success(category);
  } catch (error) {
    return handleApiError(error);
  }
}
