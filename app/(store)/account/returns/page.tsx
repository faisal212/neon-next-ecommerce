import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listUserReturns } from "@/lib/services/return.service";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { EmptyState } from "@/components/store/empty-state";
import { PaginationControls } from "@/components/store/pagination-controls";

export const metadata: Metadata = {
  title: "My Returns",
  description: "View and manage your return requests.",
};

const RETURNS_PER_PAGE = 10;

const statusStyles: Record<string, string> = {
  pending: "bg-tertiary/20 text-tertiary",
  approved: "bg-primary/20 text-primary",
  processing: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  rejected: "bg-destructive/20 text-destructive",
};

export default async function ReturnsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);

  let user = null;
  let returns: Awaited<ReturnType<typeof listUserReturns>>["data"] = [];
  let total = 0;

  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }

  if (user) {
    try {
      const result = await listUserReturns(user.id, {
        page,
        limit: RETURNS_PER_PAGE,
        offset: (page - 1) * RETURNS_PER_PAGE,
      });
      returns = result.data;
      total = result.total;
    } catch {
      // DB not connected
    }
  }

  const totalPages = Math.ceil(total / RETURNS_PER_PAGE);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Returns" },
        ]}
      />

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Returns</h1>
          <p className="mt-1 text-on-surface-variant">
            Track your return requests.
          </p>
        </div>
      </div>

      {returns.length > 0 ? (
        <>
          <div className="mt-8 flex flex-col gap-3">
            {returns.map((ret) => (
              <div
                key={ret.id}
                className="rounded-lg border border-outline-variant/10 bg-surface-container p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold">
                      Return #{ret.id.slice(0, 8)}...
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {new Date(ret.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusStyles[ret.status] ?? "bg-surface-container-highest text-on-surface-variant"}`}
                  >
                    {ret.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-on-surface-variant">
                  Reason: {ret.reason}
                </p>
                {ret.description && (
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {ret.description}
                  </p>
                )}
                {ret.resolution && (
                  <div className="mt-3 rounded bg-surface-container-low p-3">
                    <p className="text-xs font-bold text-on-surface-variant">
                      Resolution
                    </p>
                    <p className="mt-0.5 text-sm">{ret.resolution}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10">
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                basePath="/account/returns"
              />
            </div>
          )}
        </>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={<RotateCcw size={28} />}
            title="No return requests"
            description="You haven't submitted any return requests. If you need to return an item, go to your order details."
            action={{ label: "View Orders", href: "/account/orders" }}
          />
        </div>
      )}
    </div>
  );
}
