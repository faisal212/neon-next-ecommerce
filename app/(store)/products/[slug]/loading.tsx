import { Skeleton } from '@/components/ui/skeleton';

export default function ProductLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="relative min-h-screen flex flex-col lg:flex-row items-center px-8 lg:px-12 overflow-hidden bg-surface max-w-[1920px] mx-auto">
        {/* Left half */}
        <div className="lg:w-1/2 flex flex-col justify-center py-20 lg:py-0">
          <div className="flex items-center gap-3 mb-8">
            <Skeleton className="w-2 h-2 rounded-full bg-surface-container" />
            <Skeleton className="h-3 w-24 bg-surface-container" />
          </div>
          <Skeleton className="h-16 lg:h-20 w-full max-w-lg mb-4 bg-surface-container" />
          <Skeleton className="h-10 w-80 mb-4 bg-surface-container" />
          <Skeleton className="h-5 w-full max-w-md mb-2 bg-surface-container" />
          <Skeleton className="h-5 w-72 mb-12 bg-surface-container" />
          <div className="grid grid-cols-3 gap-8 border-l border-outline-variant/20 pl-8 mb-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-12 bg-surface-container" />
                <Skeleton className="h-6 w-20 bg-surface-container" />
              </div>
            ))}
          </div>
        </div>

        {/* Right half */}
        <div className="lg:w-1/2 flex items-center justify-center">
          <Skeleton className="h-[400px] lg:h-[600px] w-full max-w-[600px] rounded-lg bg-surface-container" />
        </div>
      </section>

      {/* Configurator skeleton */}
      <section className="bg-surface-container-low py-24 px-8 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-12">
            {/* Image gallery skeleton */}
            <Skeleton className="aspect-square w-full rounded-lg bg-surface-container" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-16 h-16 rounded bg-surface-container" />
              ))}
            </div>
            {/* Configurator skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-5 w-20 bg-surface-container" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-10 h-10 rounded-full bg-surface-container" />
                ))}
              </div>
              <Skeleton className="h-5 w-16 bg-surface-container" />
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="w-16 h-10 rounded bg-surface-container" />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="p-10 rounded-xl bg-surface-container space-y-6">
              <Skeleton className="h-4 w-40 bg-surface-container-high" />
              <Skeleton className="h-10 w-48 bg-surface-container-high" />
              <Skeleton className="h-8 w-32 bg-surface-container-high" />
              <Skeleton className="h-14 w-full rounded-lg bg-surface-container-high" />
              <div className="flex gap-6 pt-4">
                <Skeleton className="h-4 w-28 bg-surface-container-high" />
                <Skeleton className="h-4 w-28 bg-surface-container-high" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial skeleton */}
      <section className="py-32 px-8 lg:px-12 bg-surface">
        <div className="max-w-[1400px] mx-auto">
          <Skeleton className="h-16 w-full max-w-lg mb-8 bg-surface-container" />
          <Skeleton className="h-5 w-full max-w-2xl mb-3 bg-surface-container" />
          <Skeleton className="h-5 w-96 mb-20 bg-surface-container" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-lg bg-surface-container" />
            <Skeleton className="h-48 rounded-lg bg-surface-container" />
          </div>
        </div>
      </section>
    </>
  );
}
