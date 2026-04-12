import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { listCategories } from "@/lib/services/category.service";
import { SectionHeader } from "@/components/store/section-header";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse product categories at Refine. Shop by smartphones, wearables, audio, smart home, and lifestyle accessories.",
};

const FALLBACK_CATEGORIES = [
  { nameEn: "Watches", slug: "watches" },
  { nameEn: "Kurtas", slug: "kurtas" },
  { nameEn: "Menswear", slug: "menswear" },
  { nameEn: "Womenswear", slug: "womenswear" },
  { nameEn: "Footwear", slug: "footwear" },
  { nameEn: "Accessories", slug: "accessories" },
];

export default async function CategoriesPage() {
  "use cache";
  cacheLife("minutes");
  cacheTag("collection-all");

  let categories: { nameEn: string; slug: string }[];

  try {
    const dbCategories = await listCategories();
    categories =
      dbCategories.length > 0
        ? dbCategories.map((c) => ({ nameEn: c.nameEn, slug: c.slug }))
        : FALLBACK_CATEGORIES;
  } catch {
    categories = FALLBACK_CATEGORIES;
  }

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Categories" }]}
      />

      <div className="mt-10">
        <SectionHeader label="Browse" title="Shop by Category" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group rounded-lg bg-surface-container p-8 transition-all duration-300 hover:bg-surface-container-high"
          >
            <h3 className="text-2xl font-bold text-white transition-colors group-hover:text-primary">
              {category.nameEn}
            </h3>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Explore
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
