import { type NextRequest } from 'next/server';
import { getProductBySlug } from '@/lib/services/product.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    return success(product);
  } catch (error) {
    return handleApiError(error);
  }
}
