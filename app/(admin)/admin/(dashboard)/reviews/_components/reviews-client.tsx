"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilterTabs } from "../../../_components/filter-tabs";
import { DataTable, type Column } from "../../../_components/data-table";

interface Review {
  id: string;
  userId: string;
  productId: string;
  orderItemId: string;
  rating: number;
  comment: string | null;
  isPublished: boolean;
  createdAt: string;
  productName: string | null;
  userName: string | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < rating ? "text-yellow-400" : "text-zinc-600"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function PublishSwitch({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = useState(isPublished);

  async function toggle() {
    const next = !checked;
    setChecked(next);

    const res = await fetch(`/api/v1/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: next }),
    });

    if (res.ok) {
      startTransition(() => {
        router.refresh();
      });
    } else {
      setChecked(!next); // revert on failure
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        checked ? "bg-emerald-500" : "bg-zinc-700"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

interface ReviewsClientProps {
  reviews: Review[];
  publishedCount: number;
  unpublishedCount: number;
}

export function ReviewsClient({
  reviews,
  publishedCount,
  unpublishedCount,
}: ReviewsClientProps) {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { label: "All", value: "all", count: reviews.length },
    { label: "Published", value: "published", count: publishedCount },
    { label: "Unpublished", value: "unpublished", count: unpublishedCount },
  ];

  const filtered = reviews.filter((r) => {
    if (activeTab === "published") return r.isPublished;
    if (activeTab === "unpublished") return !r.isPublished;
    return true;
  });

  const columns: Column<Review>[] = [
    {
      key: "product",
      label: "Product",
      searchable: true,
      getValue: (r) => r.productName || "",
      render: (r) => (
        <span className="font-medium text-foreground">
          {r.productName || "—"}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      searchable: true,
      getValue: (r) => r.userName || "",
      render: (r) => (
        <span className="text-muted-foreground">{r.userName || "—"}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      getValue: (r) => r.rating,
      render: (r) => <StarRating rating={r.rating} />,
    },
    {
      key: "comment",
      label: "Comment",
      render: (r) => (
        <span className="text-muted-foreground" title={r.comment || ""}>
          {r.comment
            ? r.comment.length > 60
              ? `${r.comment.slice(0, 60)}...`
              : r.comment
            : "—"}
        </span>
      ),
    },
    {
      key: "published",
      label: "Published",
      render: (r) => <PublishSwitch id={r.id} isPublished={r.isPublished} />,
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      getValue: (r) => new Date(r.createdAt).getTime(),
      render: (r) => (
        <span className="text-muted-foreground">
          {new Date(r.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <>
      <FilterTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <DataTable
        data={filtered}
        columns={columns}
        searchPlaceholder="Search by product or customer..."
        emptyMessage="No reviews found"
      />
    </>
  );
}
