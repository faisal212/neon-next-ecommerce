import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { listProducts } from "@/lib/services/product.service";
import { ProductCard } from "@/components/store/product-card";
import { ProductCardSkeleton } from "@/components/store/product-card-skeleton";
import { SectionHeader } from "@/components/store/section-header";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { PaginationControls } from "@/components/store/pagination-controls";
import { Package } from "lucide-react";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse our full collection of premium tech products. Smartphones, wearables, audio, smart home, and lifestyle accessories with free delivery across Pakistan.",
};

const PRODUCTS_PER_PAGE = 12;

export default async function ProductsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;

  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const minPrice =
    typeof searchParams.minPrice === "string"
      ? searchParams.minPrice
      : undefined;
  const maxPrice =
    typeof searchParams.maxPrice === "string"
      ? searchParams.maxPrice
      : undefined;

  return (
    <ProductsContent
      page={page}
      q={q}
      minPrice={minPrice}
      maxPrice={maxPrice}
    />
  );
}

async function ProductsContent({
  page,
  q,
  minPrice,
  maxPrice,
}: {
  page: number;
  q: string | undefined;
  minPrice: string | undefined;
  maxPrice: string | undefined;
}) {
  "use cache";
  cacheLife("minutes");
  cacheTag("collection-all");
  if (q) cacheTag(`search-${q}`);

  const pagination = {
    page,
    limit: PRODUCTS_PER_PAGE,
    offset: (page - 1) * PRODUCTS_PER_PAGE,
  };

  let products: Awaited<ReturnType<typeof listProducts>>["data"] = [];
  let total = 0;

  try {
    const result = await listProducts(
      { q, minPrice, maxPrice },
      pagination,
    );
    products = result.data;
    total = result.total;
  } catch {
    // DB not connected or query failed - will show placeholder
  }

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const hasProducts = products.length > 0;

  // Build searchParams to forward to pagination (excluding page)
  const paginationParams: Record<string, string> = {};
  if (q) paginationParams.q = q;
  if (minPrice) paginationParams.minPrice = minPrice;
  if (maxPrice) paginationParams.maxPrice = maxPrice;

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "All Products" },
        ]}
      />

      <div className="mt-10">
        <SectionHeader label="Product Collection" title="All Products" />
      </div>

      {hasProducts ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-16">
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              basePath="/products"
              searchParams={paginationParams}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center text-on-surface-variant">
              <Package size={28} />
            </div>
            <h3 className="mt-4 text-xl font-bold">Products coming soon</h3>
            <p className="mt-2 max-w-md text-on-surface-variant">
              We&apos;re curating an exceptional collection of premium tech
              products. Check back shortly.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
