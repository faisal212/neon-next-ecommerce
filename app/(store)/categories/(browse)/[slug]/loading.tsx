import { ProductCardSkeleton } from "@/components/store/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <>
      {/* Breadcrumbs skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12 bg-surface-container" />
        <Skeleton className="h-4 w-4 bg-surface-container" />
        <Skeleton className="h-4 w-20 bg-surface-container" />
        <Skeleton className="h-4 w-4 bg-surface-container" />
        <Skeleton className="h-4 w-28 bg-surface-container" />
      </div>

      {/* Header skeleton */}
      <div className="mb-16 mt-10">
        <Skeleton className="mb-2 h-3 w-20 bg-surface-container" />
        <Skeleton className="h-10 w-48 bg-surface-container" />
      </div>

      {/* Product count skeleton */}
      <Skeleton className="mb-6 h-4 w-32 bg-surface-container" />

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
