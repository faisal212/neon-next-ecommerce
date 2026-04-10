import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createProductSchema } from '@/lib/validators/product.validators';
import { listProducts, createProduct } from '@/lib/services/product.service';
import { paginated, created } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const pagination = parsePagination(request.nextUrl.searchParams);
    const { data, total } = await listProducts({ includeDrafts: true }, pagination);

    return paginated(data, {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const body = await request.json();
    const data = createProductSchema.parse(body);
    const product = await createProduct(data);
    return created(product);
  } catch (error) {
    return handleApiError(error);
  }
}
