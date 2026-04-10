import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { getCategoryBySlug, listCategoriesWithProductCount } from "@/lib/services/category.service";
import { listProductVariants } from "@/lib/services/product.service";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeader } from "@/components/store/section-header";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { PaginationControls } from "@/components/store/pagination-controls";
import { Package } from "lucide-react";

const PRODUCTS_PER_PAGE = 12;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  return getCategoryMetadata(slug);
}

async function getCategoryMetadata(slug: string): Promise<Metadata> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`collection-${slug}`);

  try {
    const category = await getCategoryBySlug(slug);
    return {
      title: category.nameEn,
      description: `Shop ${category.nameEn} at Cover. Premium tech products with free delivery across Pakistan.`,
    };
  } catch {
    const formatted = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: formatted,
      description: `Shop ${formatted} at Cover. Premium tech products with free delivery across Pakistan.`,
    };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page) || 1);
  const minPrice =
    typeof sp.minPrice === "string" ? sp.minPrice : undefined;
  const maxPrice =
    typeof sp.maxPrice === "string" ? sp.maxPrice : undefined;

  return (
    <CategoryContent
      slug={slug}
      page={page}
      minPrice={minPrice}
      maxPrice={maxPrice}
    />
  );
}

async function CategoryContent({
  slug,
  page,
  minPrice,
  maxPrice,
}: {
  slug: string;
  page: number;
  minPrice: string | undefined;
  maxPrice: string | undefined;
}) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`collection-${slug}`);

  const pagination = {
    page,
    limit: PRODUCTS_PER_PAGE,
    offset: (page - 1) * PRODUCTS_PER_PAGE,
  };

  // Fetch category and products
  let categoryName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  let products: Awaited<ReturnType<typeof listProductVariants>>["data"] = [];
  let total = 0;
  let allCategories: Awaited<ReturnType<typeof listCategoriesWithProductCount>> = [];

  try {
    const [category, result, cats] = await Promise.all([
      getCategoryBySlug(slug).catch(() => null),
      listProductVariants(
        { categorySlug: slug, minPrice, maxPrice },
        pagination,
      ),
      listCategoriesWithProductCount().catch(() => []),
    ]);

    if (category) {
      categoryName = category.nameEn;
    }

    products = result.data;
    total = result.total;
    allCategories = cats;
  } catch {
    // DB not connected - will show placeholder
  }

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const hasProducts = products.length > 0;

  const paginationParams: Record<string, string> = {};
  if (minPrice) paginationParams.minPrice = minPrice;
  if (maxPrice) paginationParams.maxPrice = maxPrice;

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: categoryName },
        ]}
      />

      <div className="mt-10">
        <SectionHeader
          label="Category"
          title={categoryName}
        />
      </div>

      <div className="flex gap-10">
        {/* ── Sidebar Filters ────────────────────────────── */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 space-y-8">
            {/* Categories Section */}
            {allCategories.length > 0 && (
              <div>
                <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Categories
                </h4>
                <nav className="space-y-2">
                  {allCategories.map((cat) => {
                    const isActive = cat.slug === slug;
                    return (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className={`flex items-center justify-between rounded px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-surface-container-high font-bold text-primary"
                            : "text-on-surface-variant hover:bg-surface-container hover:text-white"
                        }`}
                      >
                        {cat.nameEn}
                        {cat.productCount > 0 && (
                          <span className="text-[10px] text-on-surface-variant/50">{cat.productCount}</span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Price Range Filter */}
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Price Range
              </h4>
              <form action={`/categories/${slug}`} method="GET" className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    defaultValue={minPrice ?? ""}
                    min={0}
                    className="w-full rounded bg-surface-container-highest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="flex items-center text-on-surface-variant text-xs">–</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    defaultValue={maxPrice ?? ""}
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
                {(minPrice || maxPrice) && (
                  <Link
                    href={`/categories/${slug}`}
                    className="block text-center text-xs text-on-surface-variant hover:text-primary transition-colors"
                  >
                    Clear filter
                  </Link>
                )}
              </form>
            </div>
          </div>
        </aside>

        {/* ── Product Grid ───────────────────────────────── */}
        <div className="flex-1">
          {hasProducts ? (
            <>
              <p className="mb-6 text-sm text-on-surface-variant">
                {total} product{total !== 1 ? "s" : ""} found
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((item) => (
                  <ProductCard
                    key={item.variantId}
                    product={item}
                    variantId={item.variantId}
                    variantLabel={item.variantLabel ?? undefined}
                    displayPrice={item.totalPricePkr}
                    image={item.image}
                  />
                ))}
              </div>

              <div className="mt-16">
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  basePath={`/categories/${slug}`}
                  searchParams={paginationParams}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant">
                <Package size={28} />
              </div>
              <h3 className="mt-6 text-xl font-bold">Products coming soon</h3>
              <p className="mt-2 max-w-md text-on-surface-variant">
                We&apos;re adding products to this category. Check back
                shortly.
              </p>
              <Link
                href="/"
                className="mt-8 rounded bg-primary/10 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
              >
                Browse all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
