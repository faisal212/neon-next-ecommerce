import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listUserTickets } from "@/lib/services/support-ticket.service";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { EmptyState } from "@/components/store/empty-state";
import { PaginationControls } from "@/components/store/pagination-controls";

export const metadata: Metadata = {
  title: "Support Tickets",
  description: "View and manage your support tickets.",
};

const TICKETS_PER_PAGE = 10;

const statusStyles: Record<string, string> = {
  open: "bg-tertiary/20 text-tertiary",
  in_progress: "bg-primary/20 text-primary",
  waiting_customer: "bg-blue-500/20 text-blue-400",
  resolved: "bg-green-500/20 text-green-400",
  closed: "bg-surface-container-highest text-on-surface-variant",
};

const priorityStyles: Record<string, string> = {
  low: "text-on-surface-variant",
  medium: "text-tertiary",
  high: "text-primary",
  urgent: "text-destructive",
};

export default async function SupportPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);

  let user = null;
  let tickets: Awaited<ReturnType<typeof listUserTickets>>["data"] = [];
  let total = 0;

  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected
  }

  if (user) {
    try {
      const result = await listUserTickets(user.id, {
        page,
        limit: TICKETS_PER_PAGE,
        offset: (page - 1) * TICKETS_PER_PAGE,
      });
      tickets = result.data;
      total = result.total;
    } catch {
      // DB not connected
    }
  }

  const totalPages = Math.ceil(total / TICKETS_PER_PAGE);

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
          <h1 className="text-2xl font-bold tracking-tight">
            Support Tickets
          </h1>
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

      {tickets.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="mt-8 hidden overflow-hidden rounded-lg border border-outline-variant/10 md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Ticket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="bg-surface-container transition-colors hover:bg-surface-container-high"
                  >
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold font-mono text-primary">
                        #{ticket.ticketNumber}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">{ticket.subject}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusStyles[ticket.status] ?? "bg-surface-container-highest text-on-surface-variant"}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-bold capitalize ${priorityStyles[ticket.priority] ?? "text-on-surface-variant"}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-on-surface-variant">
                      {new Date(ticket.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-8 flex flex-col gap-3 md:hidden">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-lg border border-outline-variant/10 bg-surface-container p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold font-mono text-primary">
                      #{ticket.ticketNumber}
                    </span>
                    <p className="mt-1 text-sm font-bold">{ticket.subject}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusStyles[ticket.status] ?? "bg-surface-container-highest text-on-surface-variant"}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-on-surface-variant">
                  <span
                    className={`font-bold capitalize ${priorityStyles[ticket.priority] ?? "text-on-surface-variant"}`}
                  >
                    {ticket.priority}
                  </span>
                  <span>
                    {new Date(ticket.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10">
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                basePath="/account/support"
              />
            </div>
          )}
        </>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={<MessageSquare size={28} />}
            title="No support tickets"
            description="Need help? Create a new support ticket and our team will get back to you."
            action={{ label: "Create Ticket", href: "/account/support/new" }}
          />
        </div>
      )}
    </div>
  );
}
