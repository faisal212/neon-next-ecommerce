import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { getCategoryBySlug } from "@/lib/services/category.service";
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
  cacheLife("weeks");
  cacheTag(`category-meta-${slug}`);

  try {
    const category = await getCategoryBySlug(slug);
    return {
      title: category.nameEn,
      description: `Shop ${category.nameEn} at Refine. Premium tech products with free delivery across Pakistan.`,
    };
  } catch {
    const formatted = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: formatted,
      description: `Shop ${formatted} at Refine. Premium tech products with free delivery across Pakistan.`,
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
  const minPrice = typeof sp.minPrice === "string" ? sp.minPrice : undefined;
  const maxPrice = typeof sp.maxPrice === "string" ? sp.maxPrice : undefined;

  return (
    <>
      <CategoryHeader slug={slug} />
      <CategoryProducts slug={slug} page={page} minPrice={minPrice} maxPrice={maxPrice} />
    </>
  );
}

// ─── Cached: Category Header (breadcrumbs + title) ─────────────────────

async function CategoryHeader({ slug }: { slug: string }) {
  "use cache";
  cacheLife("weeks");
  cacheTag(`category-meta-${slug}`);

  let categoryName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  try {
    const category = await getCategoryBySlug(slug);
    categoryName = category.nameEn;
  } catch {
    // fallback to formatted slug
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: categoryName },
        ]}
      />
      <div className="mt-10">
        <SectionHeader label="Category" title={categoryName} />
      </div>
    </>
  );
}

// ─── Cached: Product Grid ──────────────────────────────────────────────

async function CategoryProducts({
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
  cacheLife("days");
  cacheTag(`collection-${slug}`);

  const pagination = {
    page,
    limit: PRODUCTS_PER_PAGE,
    offset: (page - 1) * PRODUCTS_PER_PAGE,
  };

  let products: Awaited<ReturnType<typeof listProductVariants>>["data"] = [];
  let total = 0;

  try {
    const result = await listProductVariants(
      { categorySlug: slug, minPrice, maxPrice },
      pagination,
    );
    products = result.data;
    total = result.total;
  } catch {
    // DB not connected
  }

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const hasProducts = products.length > 0;

  const paginationParams: Record<string, string> = {};
  if (minPrice) paginationParams.minPrice = minPrice;
  if (maxPrice) paginationParams.maxPrice = maxPrice;

  return hasProducts ? (
    <>
      <p className="mb-6 text-sm text-on-surface-variant">
        {total} product{total !== 1 ? "s" : ""} found
      </p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 xl:grid-cols-3">
        {products.map((item) => (
          <ProductCard
            key={item.variantId}
            product={item}
            variantId={item.variantId}
            variantLabel={item.variantLabel ?? undefined}
            displayPrice={item.totalPricePkr}
            image={item.image}
            sizes="(max-width: 1280px) 50vw, (max-width: 1440px) 25vw, 344px"
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
        We&apos;re adding products to this category. Check back shortly.
      </p>
      <Link
        href="/"
        className="mt-8 rounded bg-primary/10 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
      >
        Browse all products
      </Link>
    </div>
  );
}
