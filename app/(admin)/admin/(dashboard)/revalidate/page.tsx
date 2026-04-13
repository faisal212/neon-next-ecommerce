import { RevalidateButtons } from "./_components/revalidate-buttons";

export const metadata = {
  title: "Revalidate Caches",
};

export default function RevalidatePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight text-white">
          Revalidate Caches
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Force-refresh the storefront cache when content changes aren&apos;t
          showing up. Admin mutations normally bust caches automatically — use
          this only when something slips through.
        </p>
      </div>

      <div className="mb-8 space-y-4 rounded-lg border border-sidebar-border bg-surface-container/50 p-6">
        <div>
          <h2 className="text-sm font-bold text-white">Invalidate Products</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Busts every product detail page, the all-products listing, search
            results, and the homepage. Use this when product changes aren&apos;t
            appearing on the storefront.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Invalidate All</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Busts everything above PLUS every category page, the sidebar nav,
            the store layout (header/footer), and flash sales. Heavy-handed —
            only when the whole site feels stale.
          </p>
        </div>
      </div>

      <RevalidateButtons />
    </div>
  );
}
