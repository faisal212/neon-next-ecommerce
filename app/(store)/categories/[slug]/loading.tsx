import { ProductCardSkeleton } from "@/components/store/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
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

      <div className="flex gap-10">
        {/* Sidebar skeleton */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="space-y-8">
            {/* Categories filter skeleton */}
            <div>
              <Skeleton className="mb-4 h-3 w-20 bg-surface-container" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-9 w-full bg-surface-container"
                  />
                ))}
              </div>
            </div>

            {/* Price range skeleton */}
            <div>
              <Skeleton className="mb-4 h-3 w-24 bg-surface-container" />
              <Skeleton className="h-6 w-full bg-surface-container" />
            </div>

            {/* Finish skeleton */}
            <div>
              <Skeleton className="mb-4 h-3 w-14 bg-surface-container" />
              <div className="flex gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-7 w-7 rounded-full bg-surface-container"
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product grid skeleton */}
        <div className="flex-1">
          <Skeleton className="mb-6 h-4 w-32 bg-surface-container" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
