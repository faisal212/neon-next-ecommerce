import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/catalog";
import { PageHeader } from "../../../_components/page-header";
import { CategoryForm } from "../_components/category-form";

export default async function NewCategoryPage() {
  const allCategories = await db
    .select({ id: categories.id, nameEn: categories.nameEn })
    .from(categories)
    .orderBy(categories.nameEn);

  return (
    <>
      <PageHeader title="Add Category" />
      <CategoryForm categories={allCategories} />
    </>
  );
}
