import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import {
  TicketsList,
  TicketsListSkeleton,
} from "./_components/tickets-list";

export const metadata: Metadata = {
  title: "Support Tickets",
  description: "View and manage your support tickets.",
};

export default async function SupportPage(props: {
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
          { label: "Support" },
        ]}
      />

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="mt-1 text-on-surface-variant">
            Get help with your orders and account.
          </p>
        </div>
        <Link
          href="/account/support/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary-fixed transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Ticket
        </Link>
      </div>

      <Suspense key={`tickets-${page}`} fallback={<TicketsListSkeleton />}>
        <TicketsList page={page} />
      </Suspense>
    </div>
  );
}
