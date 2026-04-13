import { type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema/catalog";
import { success } from "@/lib/utils/api-response";
import { handleApiError } from "@/lib/errors/handler";

const IMMEDIATE = { expire: 0 } as const;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(["super_admin", "manager"]);
    const body = await request.json().catch(() => ({}));
    const scope = body.scope === "all" ? "all" : "products";

    // Fetch all product slugs and bust each product-${slug} tag
    const productRows = await db.select({ slug: products.slug }).from(products);
    for (const { slug } of productRows) {
      revalidateTag(`product-${slug}`, IMMEDIATE);
    }

    // Bust global product-adjacent tags
    revalidateTag("collection-all", IMMEDIATE);
    revalidateTag("search", IMMEDIATE);
    revalidateTag("homepage", IMMEDIATE);

    let categoryCount = 0;

    if (scope === "all") {
      const categoryRows = await db
        .select({ slug: categories.slug })
        .from(categories);
      for (const { slug } of categoryRows) {
        revalidateTag(`collection-${slug}`, IMMEDIATE);
        revalidateTag(`category-meta-${slug}`, IMMEDIATE);
      }
      categoryCount = categoryRows.length;

      // Bust remaining global tags
      revalidateTag("category-nav", IMMEDIATE);
      revalidateTag("store-layout", IMMEDIATE);
      revalidateTag("flash-sales", IMMEDIATE);
    }

    return success({
      scope,
      products: productRows.length,
      categories: categoryCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
