import { type NextRequest, connection } from 'next/server';
import { success } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';
import { rateLimit, rateLimitResponse } from '@/lib/utils/rate-limit';
import { listProducts } from '@/lib/services/product.service';

export async function GET(request: NextRequest) {
  try {
    await connection();
    const q = request.nextUrl.searchParams.get('q');
    if (!q || q.trim().length < 2) {
      return success([]);
    }

    // Rate limit: 30 searches per IP per minute
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const rl = rateLimit(`search:${ip}`, 30, 60 * 1000);
    if (!rl.allowed) return rateLimitResponse(rl);

    // Delegate to listProducts so results include enriched category + images
    // — same source of truth as the /search page. The ILIKE filtering and
    // isActive/isPublished guards live inside listProducts.
    const pagination = parsePagination(request.nextUrl.searchParams);
    const { data } = await listProducts({ q: q.trim() }, pagination);

    return success(data);
  } catch (error) {
    return handleApiError(error);
  }
}
