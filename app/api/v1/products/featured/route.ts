import { connection } from 'next/server';
import { listProducts } from '@/lib/services/product.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    await connection();
    const { data } = await listProducts(
      { featured: true },
      { page: 1, limit: 20, offset: 0 },
    );
    return success(data);
  } catch (error) {
    return handleApiError(error);
  }
}
