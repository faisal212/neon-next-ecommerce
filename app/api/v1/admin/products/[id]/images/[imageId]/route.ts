import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productImages } from '@/lib/db/schema/catalog';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { NotFoundError } from '@/lib/errors/api-error';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id, imageId } = await params;

    const [deleted] = await db
      .delete(productImages)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, id)))
      .returning();

    if (!deleted) throw new NotFoundError('Image not found');
    return success({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id, imageId } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.altText !== undefined) updates.altText = body.altText;
    if (body.isPrimary !== undefined) updates.isPrimary = body.isPrimary;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
    if (body.variantId !== undefined) updates.variantId = body.variantId;

    // If setting as primary, unset all others first
    if (body.isPrimary) {
      await db
        .update(productImages)
        .set({ isPrimary: false })
        .where(eq(productImages.productId, id));
    }

    const [image] = await db
      .update(productImages)
      .set(updates)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, id)))
      .returning();

    if (!image) throw new NotFoundError('Image not found');
    return success(image);
  } catch (error) {
    return handleApiError(error);
  }
}
