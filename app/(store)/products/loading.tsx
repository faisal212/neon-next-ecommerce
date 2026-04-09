import { ProductCardSkeleton } from "@/components/store/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      {/* Breadcrumbs skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12 bg-surface-container" />
        <Skeleton className="h-4 w-4 bg-surface-container" />
        <Skeleton className="h-4 w-24 bg-surface-container" />
      </div>

      {/* Header skeleton */}
      <div className="mb-16 mt-10">
        <Skeleton className="mb-2 h-3 w-36 bg-surface-container" />
        <Skeleton className="h-10 w-56 bg-surface-container" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
