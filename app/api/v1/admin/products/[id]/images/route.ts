import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createImageSchema } from '@/lib/validators/product.validators';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productImages } from '@/lib/db/schema/catalog';
import { invalidateProductById } from '@/lib/cache/revalidate';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const images = await db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(productImages.sortOrder);
    return success(images);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id } = await params;
    const body = await request.json();
    const data = createImageSchema.parse(body);
    const [image] = await db.insert(productImages).values({
      productId: id,
      variantId: data.variantId ?? null,
      url: data.url,
      altText: data.altText ?? null,
      isPrimary: data.isPrimary ?? false,
      sortOrder: data.sortOrder ?? 0,
    }).returning();
    await invalidateProductById(id);
    return created(image);
  } catch (error) {
    return handleApiError(error);
  }
}
