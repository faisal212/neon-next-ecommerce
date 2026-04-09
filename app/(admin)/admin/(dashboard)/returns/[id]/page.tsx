import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { returnRequests, returnItems } from "@/lib/db/schema/support";
import { orders, orderItems } from "@/lib/db/schema/orders";
import { productVariants, products } from "@/lib/db/schema/catalog";
import { users } from "@/lib/db/schema/users";
import { BackLink } from "../../../_components/back-link";
import { StatusBadge } from "../../../_components/status-badge";
import { ReturnActions } from "../_components/return-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReturnDetailPage({ params }: Props) {
  const { id } = await params;

  const [returnRequest] = await db
    .select()
    .from(returnRequests)
    .where(eq(returnRequests.id, id))
    .limit(1);
  if (!returnRequest) notFound();

  const [items, orderRows, customerRows] = await Promise.all([
    db
      .select({
        id: returnItems.id,
        quantity: returnItems.quantity,
        condition: returnItems.condition,
        productName: products.nameEn,
        color: productVariants.color,
        size: productVariants.size,
      })
      .from(returnItems)
      .innerJoin(orderItems, eq(returnItems.orderItemId, orderItems.id))
      .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(returnItems.returnRequestId, returnRequest.id)),
    db
      .select()
      .from(orders)
      .where(eq(orders.id, returnRequest.orderId))
      .limit(1),
    db
      .select()
      .from(users)
      .where(eq(users.id, returnRequest.userId))
      .limit(1),
  ]);

  const order = orderRows[0] ?? null;
  const customer = customerRows[0] ?? null;

  return (
    <>
      <BackLink href="/admin/returns" label="Back to Returns" />

      {/* Return header */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          Return {returnRequest.id.slice(0, 8)}...
        </h1>
        <StatusBadge status={returnRequest.status} />
        <span className="text-[13px] text-muted-foreground">
          {new Date(returnRequest.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Return Items */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Return Items</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Product
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Variant
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Qty
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Condition
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-[13px] text-muted-foreground"
                    >
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="border-border/50">
                      <TableCell className="text-[13px] font-medium text-foreground">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {[item.color, item.size].filter(Boolean).join(" / ") ||
                          "\u2014"}
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-[13px] capitalize text-muted-foreground">
                        {item.condition}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Return Reason */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Reason</h3>
            <div className="space-y-2 text-[13px]">
              <div className="font-medium capitalize text-foreground">
                {returnRequest.reason}
              </div>
              {returnRequest.description && (
                <p className="leading-relaxed text-muted-foreground">
                  {returnRequest.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Status Card */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Status</h3>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status</span>
                <StatusBadge status={returnRequest.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {new Date(returnRequest.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
              {returnRequest.resolution && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution</span>
                  <span className="capitalize text-foreground">
                    {returnRequest.resolution}
                  </span>
                </div>
              )}
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
                {customer.phonePk && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="text-foreground">{customer.phonePk}</span>
                  </div>
                )}
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
            <ReturnActions
              returnId={returnRequest.id}
              currentStatus={returnRequest.status}
              currentResolution={returnRequest.resolution}
            />
          </div>
        </div>
      </div>
    </>
  );
}
