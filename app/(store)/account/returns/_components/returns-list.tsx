import { redirect } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listUserReturns } from "@/lib/services/return.service";
import { EmptyState } from "@/components/store/empty-state";
import { PaginationControls } from "@/components/store/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";

const RETURNS_PER_PAGE = 10;
const CARD_MIN_HEIGHT = 140;

const statusStyles: Record<string, string> = {
  pending: "bg-tertiary/20 text-tertiary",
  approved: "bg-primary/20 text-primary",
  processing: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  rejected: "bg-destructive/20 text-destructive",
};

/**
 * Dynamic island: paginated list of the user's return requests.
 */
export async function ReturnsList({ page }: { page: number }) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }
  if (!user) {
    redirect("/auth/login?callbackUrl=/account/returns");
  }

  let returns: Awaited<ReturnType<typeof listUserReturns>>["data"] = [];
  let total = 0;

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

  const totalPages = Math.ceil(total / RETURNS_PER_PAGE);

  if (returns.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon={<RotateCcw size={28} />}
          title="No return requests"
          description="You haven't submitted any return requests. If you need to return an item, go to your order details."
          action={{ label: "View Orders", href: "/account/orders" }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 flex flex-col gap-3">
        {returns.map((ret) => (
          <div
            key={ret.id}
            className="rounded-lg border border-outline-variant/10 bg-surface-container p-5"
            style={{ minHeight: CARD_MIN_HEIGHT }}
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
  );
}

export function ReturnsListSkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-3">
      {Array.from({ length: RETURNS_PER_PAGE }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-outline-variant/10 bg-surface-container p-5"
          style={{ minHeight: CARD_MIN_HEIGHT }}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32 bg-surface-container-high" />
              <Skeleton className="h-3 w-24 bg-surface-container-high" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full bg-surface-container-high" />
          </div>
          <Skeleton className="mt-3 h-4 w-60 bg-surface-container-high" />
          <Skeleton className="mt-2 h-4 w-48 bg-surface-container-high" />
        </div>
      ))}
    </div>
  );
}
