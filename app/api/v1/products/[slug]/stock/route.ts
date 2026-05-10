import { type NextRequest } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, productVariants, inventory } from '@/lib/db/schema/catalog';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { NotFoundError } from '@/lib/errors/api-error';

// Live per-variant stock for a product, fetched by the client after hydration.
// Kept off the cached product shell so inventory numbers are always fresh.
// Under Cache Components, route handlers without `'use cache'` are dynamic by default.

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product) throw new NotFoundError('Product not found');

    const variants = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.productId, product.id));

    const variantIds = variants.map((v) => v.id);
    const rows = variantIds.length
      ? await db
          .select({
            variantId: inventory.variantId,
            onHand: inventory.quantityOnHand,
            reserved: inventory.quantityReserved,
          })
          .from(inventory)
          .where(inArray(inventory.variantId, variantIds))
      : [];

    const stock: Record<string, { onHand: number; reserved: number; available: number }> = {};
    for (const r of rows) {
      stock[r.variantId] = {
        onHand: r.onHand,
        reserved: r.reserved,
        available: r.onHand - r.reserved,
      };
    }

    return success(stock);
  } catch (error) {
    return handleApiError(error);
  }
}
