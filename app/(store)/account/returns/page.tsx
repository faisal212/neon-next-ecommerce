import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import {
  ReturnsList,
  ReturnsListSkeleton,
} from "./_components/returns-list";

export const metadata: Metadata = {
  title: "My Returns",
  description: "View and manage your return requests.",
};

export default async function ReturnsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);

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

      <Suspense key={`returns-${page}`} fallback={<ReturnsListSkeleton />}>
        <ReturnsList page={page} />
      </Suspense>
    </div>
  );
}
