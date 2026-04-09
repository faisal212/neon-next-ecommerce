import Link from "next/link";
import { eq, sql, desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, categories, productVariants, productImages, inventory } from "@/lib/db/schema/catalog";
import { PageHeader } from "../../_components/page-header";
import { Plus } from "lucide-react";
import { ProductsTable } from "./_components/products-table";

export default async function ProductsPage() {
  // Fetch all categories for the filter dropdown
  const allCategories = await db
    .select({ id: categories.id, nameEn: categories.nameEn })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.nameEn);

  const productList = await db
    .select({
      id: products.id,
      nameEn: products.nameEn,
      slug: products.slug,
      basePricePkr: products.basePricePkr,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      createdAt: products.createdAt,
      categoryName: categories.nameEn,
      variantCount: sql<number>`(SELECT count(*)::int FROM product_variants WHERE product_id = ${products.id})`,
      imageCount: sql<number>`(SELECT count(*)::int FROM product_images WHERE product_id = ${products.id})`,
      primaryImage: sql<string | null>`(SELECT url FROM product_images WHERE product_id = ${products.id} AND is_primary = true LIMIT 1)`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  const serialized = productList.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    categoryName: p.categoryName || "—",
    variantCount: p.variantCount ?? 0,
    imageCount: p.imageCount ?? 0,
    primaryImage: p.primaryImage ?? null,
  }));

  return (
    <>
      <PageHeader title="Products">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </PageHeader>

      <ProductsTable
        data={serialized}
        categories={allCategories}
      />
    </>
  );
}
