import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory, courierAssignments, codCollections } from "@/lib/db/schema/orders";
import { productVariants, products } from "@/lib/db/schema/catalog";
import { users } from "@/lib/db/schema/users";
import { addresses } from "@/lib/db/schema/users";
import { adminUsers } from "@/lib/db/schema/users";
import { BackLink } from "../../../_components/back-link";
import { StatusBadge } from "../../../_components/status-badge";
import {
  StatusUpdateForm,
  CourierAssignForm,
  CodCollectionForm,
} from "../_components/order-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  params: Promise<{ id: string }>;
}

function formatPkr(amount: string | number) {
  return `Rs. ${Number(amount).toLocaleString("en-PK")}`;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();

  const [items, history, courierRows, codRows] = await Promise.all([
    db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        unitPricePkr: orderItems.unitPricePkr,
        totalPkr: orderItems.totalPkr,
        productName: products.nameEn,
        color: productVariants.color,
        size: productVariants.size,
      })
      .from(orderItems)
      .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(orderItems.orderId, order.id)),
    db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, order.id))
      .orderBy(orderStatusHistory.createdAt),
    db
      .select()
      .from(courierAssignments)
      .where(eq(courierAssignments.orderId, order.id))
      .limit(1),
    db
      .select()
      .from(codCollections)
      .where(eq(codCollections.orderId, order.id))
      .limit(1),
  ]);

  const courier = courierRows[0] ?? null;
  const cod = codRows[0] ?? null;

  // Get customer info
  let customerName = order.guestPhone || "Guest";
  let customerEmail = order.guestEmail || "";
  let customerPhone = order.guestPhone || "";

  if (order.userId) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1);
    if (user) {
      customerName = user.name || "Unknown";
      customerEmail = user.email;
      customerPhone = user.phonePk || "";
    }
  }

  // Get shipping address
  let address = null;
  if (order.addressId) {
    const [addr] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, order.addressId))
      .limit(1);
    address = addr ?? null;
  }

  // Get admin names for status history
  const adminIds = history
    .map((h) => h.changedBy)
    .filter((id): id is string => id !== null);
  let adminMap: Record<string, string> = {};
  if (adminIds.length > 0) {
    const admins = await db
      .select({ id: adminUsers.id, name: adminUsers.name })
      .from(adminUsers);
    adminMap = Object.fromEntries(admins.map((a) => [a.id, a.name]));
  }

  return (
    <>
      <BackLink href="/admin/orders" label="Back to Orders" />

      {/* Order header */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          Order #{order.orderNumber}
        </h1>
        <StatusBadge status={order.status} />
        <span className="text-[13px] text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Order Items */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Order Items</h3>
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
                    Unit Price
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Subtotal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-border/50">
                    <TableCell className="text-[13px] font-medium text-foreground">
                      {item.productName}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {[item.color, item.size].filter(Boolean).join(" / ") || "—"}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {formatPkr(item.unitPricePkr)}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {formatPkr(item.totalPkr)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Price Breakdown</h3>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPkr(order.subtotalPkr)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{formatPkr(order.shippingChargePkr)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>COD Fee</span>
                <span>{formatPkr(order.codChargePkr)}</span>
              </div>
              {Number(order.discountPkr) > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount</span>
                  <span>-{formatPkr(order.discountPkr)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold text-foreground">
                <span>Total</span>
                <span>{formatPkr(order.totalPkr)}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Status History</h3>
            <div className="relative space-y-0">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No status changes recorded
                </p>
              ) : (
                history.map((entry, i) => (
                  <div key={entry.id} className="flex gap-3 pb-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          i === history.length - 1
                            ? "bg-primary"
                            : "bg-muted-foreground"
                        }`}
                      />
                      {i < history.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="-mt-0.5">
                      <div className="text-[13px] font-medium capitalize text-foreground">
                        {entry.status}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                      {entry.changedBy && adminMap[entry.changedBy] && (
                        <div className="text-[11px] text-muted-foreground">
                          by {adminMap[entry.changedBy]}
                        </div>
                      )}
                      {entry.notes && (
                        <div className="mt-0.5 text-[11px] italic text-muted-foreground">
                          &ldquo;{entry.notes}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Customer Info */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Customer Info</h3>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="text-foreground">{customerName}</span>
              </div>
              {customerEmail && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground">{customerEmail}</span>
                </div>
              )}
              {customerPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-foreground">{customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {address && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Shipping Address</h3>
              <div className="space-y-0.5 text-[13px] leading-relaxed text-muted-foreground">
                <div className="font-medium text-foreground">
                  {address.firstName} {address.lastName}
                </div>
                {address.phonePk && <div>{address.phonePk}</div>}
                <div>{address.addressLine1}</div>
                {address.addressLine2 && <div>{address.addressLine2}</div>}
                <div>
                  {address.city}, {address.province}
                </div>
              </div>
            </div>
          )}

          {/* Courier Assignment */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Courier Assignment</h3>
            {courier ? (
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Courier</span>
                  <span className="text-foreground">{courier.courierName}</span>
                </div>
                {courier.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking #</span>
                    <span className="font-mono text-[12px] text-foreground">
                      {courier.trackingNumber}
                    </span>
                  </div>
                )}
                {courier.riderName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rider</span>
                    <span className="text-foreground">
                      {courier.riderName}
                      {courier.riderPhone ? ` (${courier.riderPhone})` : ""}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <CourierAssignForm orderId={order.id} />
            )}
          </div>

          {/* COD Collection */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">COD Collection</h3>
            {cod ? (
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected</span>
                  <span className="text-foreground">
                    {formatPkr(cod.amountExpectedPkr)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Collected</span>
                  <span className="text-foreground">
                    {formatPkr(cod.amountCollectedPkr ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={cod.status} />
                </div>
              </div>
            ) : (
              <CodCollectionForm orderId={order.id} />
            )}
          </div>

          {/* Status Update */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Update Status</h3>
            <StatusUpdateForm
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>
        </div>
      </div>
    </>
  );
}
