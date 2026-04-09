import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { supportTickets, ticketMessages } from "@/lib/db/schema/support";
import { orders } from "@/lib/db/schema/orders";
import { users } from "@/lib/db/schema/users";
import { BackLink } from "../../../_components/back-link";
import { StatusBadge } from "../../../_components/status-badge";
import { TicketActions } from "../_components/ticket-actions";
import { TicketReply } from "../_components/ticket-reply";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params;

  const [ticket] = await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.id, id))
    .limit(1);
  if (!ticket) notFound();

  const [messages, customerRows] = await Promise.all([
    db
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, ticket.id))
      .orderBy(asc(ticketMessages.createdAt)),
    db
      .select()
      .from(users)
      .where(eq(users.id, ticket.userId))
      .limit(1),
  ]);

  const customer = customerRows[0] ?? null;

  // Fetch order if linked
  let order = null;
  if (ticket.orderId) {
    const [orderRow] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, ticket.orderId))
      .limit(1);
    order = orderRow ?? null;
  }

  return (
    <>
      <BackLink href="/admin/tickets" label="Back to Tickets" />

      {/* Ticket header */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          #{ticket.ticketNumber}
        </h1>
        <StatusBadge status={ticket.status} />
        <StatusBadge status={ticket.priority} />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Subject */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-base font-semibold text-foreground">
              {ticket.subject}
            </h3>
          </div>

          {/* Message Thread */}
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-[13px] text-muted-foreground">
                No messages yet
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.senderType === "admin";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg border p-4 ${
                        isAdmin
                          ? "border-primary/20 bg-primary/5"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                            isAdmin
                              ? "bg-primary/15 text-primary"
                              : "bg-zinc-500/15 text-zinc-400"
                          }`}
                        >
                          {msg.senderType}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Reply</h3>
            <TicketReply ticketId={ticket.id} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Ticket Info */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Ticket Info</h3>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket #</span>
                <span className="font-mono text-[12px] text-foreground">
                  {ticket.ticketNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="capitalize text-foreground">
                  {ticket.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <StatusBadge status={ticket.priority} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {customer && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Customer Info</h3>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground">
                    {customer.name || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground">{customer.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Order Link */}
          {order && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Linked Order</h3>
              <div className="text-[13px]">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-mono text-[12px] text-primary underline-offset-4 hover:underline"
                >
                  #{order.orderNumber}
                </Link>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Actions</h3>
            <TicketActions
              ticketId={ticket.id}
              currentStatus={ticket.status}
            />
          </div>
        </div>
      </div>
    </>
  );
}
