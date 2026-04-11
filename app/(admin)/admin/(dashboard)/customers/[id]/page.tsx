import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, addresses } from "@/lib/db/schema/users";
import { orders } from "@/lib/db/schema/orders";
import { loyaltyPoints } from "@/lib/db/schema/marketing";
import { BackLink } from "../../../_components/back-link";
import { StatusBadge } from "../../../_components/status-badge";
import { CustomerActions } from "../_components/customer-actions";
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

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  const [customer] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!customer) notFound();

  const [recentOrders, customerAddresses, loyaltyRow] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        totalPkr: orders.totalPkr,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.userId, customer.id))
      .orderBy(desc(orders.createdAt))
      .limit(10),
    db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, customer.id)),
    db
      .select()
      .from(loyaltyPoints)
      .where(eq(loyaltyPoints.userId, customer.id))
      .limit(1),
  ]);

  const loyalty = loyaltyRow[0] ?? null;

  return (
    <>
      <BackLink href="/admin/customers" label="Back to Customers" />

      {/* Customer header */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          {`${customer.firstName} ${customer.lastName}`.trim() || "Unnamed Customer"}
        </h1>
        <StatusBadge status={customer.isActive ? "active" : "inactive"} />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Customer Profile */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Customer Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Full Name
                </div>
                <div className="mt-0.5 text-[13px]">
                  {`${customer.firstName} ${customer.lastName}`.trim() || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Email
                </div>
                <div className="mt-0.5 text-[13px]">{customer.email}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Phone
                </div>
                <div className="mt-0.5 text-[13px]">
                  {customer.phonePk || "—"}
                  {customer.isPhoneVerified && (
                    <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Joined
                </div>
                <div className="mt-0.5 text-[13px]">
                  {new Date(customer.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">
              Recent Orders
              {recentOrders.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({recentOrders.length})
                </span>
              )}
            </h3>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No orders placed yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Order #
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Total
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-border/50 cursor-pointer transition-colors duration-150 hover:bg-white/[0.02]"
                    >
                      <TableCell className="text-[13px]">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-foreground hover:text-emerald-400 transition-colors"
                        >
                          #{order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-[12px] text-muted-foreground">
                        {formatPkr(order.totalPkr)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Loyalty Points */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Loyalty Points</h3>
            {loyalty ? (
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-semibold text-emerald-400">
                    {loyalty.balance.toLocaleString("en-PK")} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Earned</span>
                  <span className="text-foreground">
                    {loyalty.totalEarned.toLocaleString("en-PK")} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Redeemed</span>
                  <span className="text-foreground">
                    {loyalty.totalRedeemed.toLocaleString("en-PK")} pts
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No loyalty points yet
              </p>
            )}
          </div>

          {/* Addresses */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">
              Addresses
              {customerAddresses.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({customerAddresses.length})
                </span>
              )}
            </h3>
            {customerAddresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No addresses saved
              </p>
            ) : (
              <div className="space-y-3">
                {customerAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-md border border-border/50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-foreground">
                        {addr.firstName} {addr.lastName}
                      </span>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                          Default
                        </span>
                      )}
                    </div>
                    {addr.phonePk && (
                      <div className="mt-0.5 text-[12px] text-muted-foreground">
                        {addr.phonePk}
                      </div>
                    )}
                    <div className="mt-1 space-y-0.5 text-[12px] leading-relaxed text-muted-foreground">
                      <div>{addr.addressLine1}</div>
                      {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                      <div>
                        {addr.city}, {addr.province}
                        {addr.postalCode ? ` ${addr.postalCode}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Account Actions</h3>
            <CustomerActions userId={customer.id} isActive={customer.isActive} />
          </div>
        </div>
      </div>
    </>
  );
}
