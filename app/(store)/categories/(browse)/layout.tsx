import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { listCategoriesWithProductCount } from "@/lib/services/category.service";
import { CategoryMobileFilters } from "./[slug]/_components/category-mobile-filters";
import { CategoryNavHighlighter } from "./[slug]/_components/category-nav-highlighter";

export default async function CategoryBrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  "use cache";
  cacheLife("weeks");
  cacheTag("category-nav");

  let allCategories: Awaited<ReturnType<typeof listCategoriesWithProductCount>> = [];
  try {
    allCategories = await listCategoriesWithProductCount();
  } catch {
    // DB not connected
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 md:px-8">
      {/* Mobile filter bar */}
      {allCategories.length > 0 && (
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <CategoryMobileFilters categories={allCategories} />
        </div>
      )}

      <div className="flex gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 space-y-8">
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Price Range
              </h4>
              <form method="GET" className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    min={0}
                    className="w-full rounded bg-surface-container-highest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="flex items-center text-on-surface-variant text-xs">–</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    min={0}
                    className="w-full rounded bg-surface-container-highest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded bg-primary/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
                >
                  Apply
                </button>
              </form>
            </div>

            {allCategories.length > 0 && (
              <div>
                <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Categories
                </h4>
                <nav className="space-y-2">
                  {allCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      data-href={`/categories/${cat.slug}`}
                      className="category-nav-link flex items-center justify-between rounded px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-white"
                    >
                      {cat.nameEn}
                      {cat.productCount > 0 && (
                        <span className="text-[10px] text-on-surface-variant/50">
                          {cat.productCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </aside>

        {/* Page content */}
        <div className="flex-1">{children}</div>
      </div>

      <CategoryNavHighlighter />
    </section>
  );
}
