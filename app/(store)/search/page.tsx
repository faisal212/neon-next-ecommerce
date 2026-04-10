import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { listProducts } from "@/lib/services/product.service";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeader } from "@/components/store/section-header";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { PaginationControls } from "@/components/store/pagination-controls";
import { EmptyState } from "@/components/store/empty-state";
import { Search } from "lucide-react";

const PRODUCTS_PER_PAGE = 12;

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  return {
    title: q ? `Search: ${q}` : "Search",
    description: q
      ? `Search results for "${q}" at Cover. Browse premium tech products.`
      : "Search the Cover store for premium tech products.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;

  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  return <SearchContent q={q} page={page} />;
}

async function SearchContent({ q, page }: { q: string; page: number }) {
  "use cache";
  cacheLife("minutes");
  cacheTag("search");
  if (q) cacheTag(`search-${q}`);

  const pagination = {
    page,
    limit: PRODUCTS_PER_PAGE,
    offset: (page - 1) * PRODUCTS_PER_PAGE,
  };

  let products: Awaited<ReturnType<typeof listProducts>>["data"] = [];
  let total = 0;

  if (q) {
    try {
      const result = await listProducts({ q }, pagination);
      products = result.data;
      total = result.total;
    } catch {
      // DB not connected - will show empty state
    }
  }

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const hasProducts = products.length > 0;

  const paginationParams: Record<string, string> = {};
  if (q) paginationParams.q = q;

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />

      <div className="mt-10">
        <SectionHeader
          label="Search Results"
          title={q ? `Results for \u2018${q}\u2019` : "Search"}
        />
      </div>

      {hasProducts ? (
        <>
          <p className="mb-6 text-sm text-on-surface-variant">
            {total} result{total !== 1 ? "s" : ""} found
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-16">
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              basePath="/search"
              searchParams={paginationParams}
            />
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Search size={28} />}
          title={
            q
              ? `No products found for \u2018${q}\u2019`
              : "Enter a search term"
          }
          description={
            q
              ? "Try adjusting your search or browse our categories for inspiration."
              : "Type a keyword above to search our entire product catalog."
          }
          action={{ label: "Browse Categories", href: "/categories" }}
        />
      )}
    </section>
  );
}
