import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/catalog";
import { BackLink } from "../../../_components/back-link";
import { PageHeader } from "../../../_components/page-header";
import { ProductForm } from "../_components/product-form";

export default async function NewProductPage() {
  const allCategories = await db
    .select({ id: categories.id, nameEn: categories.nameEn })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.nameEn);

  return (
    <>
      <BackLink href="/admin/products" label="Back to Products" />
      <PageHeader title="Add Product" subtitle="Fill in the basics — you'll add images, variants, and SEO on the next step" />
      <ProductForm categories={allCategories} />
    </>
  );
}
