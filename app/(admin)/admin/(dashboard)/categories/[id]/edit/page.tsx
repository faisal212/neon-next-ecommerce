import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/catalog";
import { BackLink } from "../../../../_components/back-link";
import { PageHeader } from "../../../../_components/page-header";
import { CategoryForm } from "../../_components/category-form";
import { SeoEditor } from "../../../../_components/seo-editor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!category) notFound();

  const allCategories = await db
    .select({ id: categories.id, nameEn: categories.nameEn })
    .from(categories)
    .orderBy(categories.nameEn);

  return (
    <>
      <BackLink href="/admin/categories" label="Back to Categories" />
      <PageHeader title={`Edit: ${category.nameEn}`} />
      <CategoryForm
        categories={allCategories}
        initialData={{
          id: category.id,
          nameEn: category.nameEn,
          nameUr: category.nameUr || "",
          parentId: category.parentId || "",
          imageUrl: category.imageUrl || "",
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          isEcosystemFeatured: category.isEcosystemFeatured,
          ecosystemOrder: category.ecosystemOrder,
        }}
      />
      <SeoEditor entityType="category" entityId={id} />
    </>
  );
}
