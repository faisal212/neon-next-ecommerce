import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="min-h-[700px] flex items-center px-8 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-12 gap-8 w-full">
          <div className="col-span-12 lg:col-span-6 space-y-6 py-20">
            <Skeleton className="h-4 w-40 bg-surface-container" />
            <Skeleton className="h-20 w-full max-w-lg bg-surface-container" />
            <Skeleton className="h-16 w-80 bg-surface-container" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-14 w-40 bg-surface-container" />
              <Skeleton className="h-14 w-48 bg-surface-container" />
            </div>
          </div>
          <div className="hidden lg:block lg:col-span-6">
            <Skeleton className="h-[500px] w-full rounded-xl bg-surface-container" />
          </div>
        </div>
      </section>

      {/* Ecosystem grid skeleton */}
      <section className="py-24 max-w-[1440px] mx-auto px-8">
        <div className="flex justify-between mb-16">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 bg-surface-container" />
            <Skeleton className="h-5 w-96 bg-surface-container" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[700px]">
          <Skeleton className="md:col-span-2 md:row-span-2 rounded-lg bg-surface-container" />
          <Skeleton className="md:col-span-2 rounded-lg bg-surface-container" />
          <Skeleton className="rounded-lg bg-surface-container" />
          <Skeleton className="rounded-lg bg-surface-container" />
        </div>
      </section>

      {/* Carousel skeleton */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto px-8 mb-12">
          <Skeleton className="h-10 w-56 bg-surface-container" />
        </div>
        <div className="flex gap-6 px-8 max-w-[1440px] mx-auto overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[300px] space-y-4">
              <Skeleton className="h-56 w-full rounded-lg bg-surface-container" />
              <Skeleton className="h-4 w-20 bg-surface-container" />
              <Skeleton className="h-6 w-40 bg-surface-container" />
              <Skeleton className="h-4 w-full bg-surface-container" />
              <Skeleton className="h-6 w-24 bg-surface-container" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}