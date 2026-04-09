import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-surface-container">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-6">
        <Skeleton className="mb-2 h-3 w-16" />
        <Skeleton className="mb-1 h-5 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}
