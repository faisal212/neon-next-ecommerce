import Link from "next/link";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/catalog";
import { PageHeader } from "../../_components/page-header";
import { Plus } from "lucide-react";
import { CategoriesTable } from "./_components/categories-table";

export default async function CategoriesPage() {
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(categories.sortOrder);

  const nameMap = Object.fromEntries(
    allCategories.map((c) => [c.id, c.nameEn])
  );

  const serialized = allCategories.map((c) => ({
    ...c,
    parentName: c.parentId ? nameMap[c.parentId] || "—" : "—",
    createdAt: "",
  }));

  return (
    <>
      <PageHeader title="Categories">
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" /> Add Category
        </Link>
      </PageHeader>

      <CategoriesTable data={serialized} />
    </>
  );
}
