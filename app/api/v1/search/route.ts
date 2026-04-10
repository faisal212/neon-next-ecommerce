import { type NextRequest } from 'next/server';
import { and, ilike, or, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema/catalog';
import { success } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';
import { rateLimit, rateLimitResponse } from '@/lib/utils/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q');
    if (!q || q.trim().length < 2) {
      return success([]);
    }

    // Rate limit: 30 searches per IP per minute
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const rl = rateLimit(`search:${ip}`, 30, 60 * 1000);
    if (!rl.allowed) return rateLimitResponse(rl);

    const pagination = parsePagination(request.nextUrl.searchParams);
    const searchTerm = `%${q.trim()}%`;

    const results = await db
      .select()
      .from(products)
      .where(
        and(
          or(
            ilike(products.nameEn, searchTerm),
            ilike(products.nameUr, searchTerm),
            ilike(products.descriptionEn, searchTerm),
          ),
          eq(products.isActive, true),
          eq(products.isPublished, true),
        ),
      )
      .limit(pagination.limit)
      .offset(pagination.offset);

    return success(results);
  } catch (error) {
    return handleApiError(error);
  }
}
