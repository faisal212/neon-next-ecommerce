import { sql, desc, eq, and, ne, or, isNull, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, codCollections } from "@/lib/db/schema/orders";
import { products, productVariants, inventory } from "@/lib/db/schema/catalog";
import { users } from "@/lib/db/schema/users";
import { PageHeader } from "../_components/page-header";
import { StatCard } from "../_components/stat-card";
import { StatusBadge } from "../_components/status-badge";
import {
  ShoppingBag,
  Banknote,
  Hourglass,
  Package,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getDashboardData() {
  // Total order volume — just a count, includes everything ever placed.
  const [orderStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(orders);

  // Revenue is cash-basis: only money that's actually been collected on
  // delivery. Order status `delivered` is not enough — an admin can mark
  // an order delivered before recording the COD payment, so we anchor on
  // cod_collections.status = 'collected'.
  const [revenueStats] = await db
    .select({
      revenue: sql<string>`coalesce(sum(${codCollections.amountCollectedPkr}), 0)`,
    })
    .from(codCollections)
    .where(eq(codCollections.status, 'collected'));

  // Pipeline = orders still in flight, including delivered-but-not-yet-
  // collected. Excludes cancelled/returned (no money owed) and orders
  // whose COD has already been collected (counted as Revenue above).
  const [pipelineStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
      pipeline: sql<string>`coalesce(sum(${orders.totalPkr}), 0)`,
    })
    .from(orders)
    .leftJoin(codCollections, eq(codCollections.orderId, orders.id))
    .where(
      and(
        notInArray(orders.status, ['cancelled', 'returned']),
        or(
          isNull(codCollections.status),
          ne(codCollections.status, 'collected'),
        ),
      ),
    );

  const [productCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.isPublished, true)));

  const [userCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.isActive, true));

  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      totalPkr: orders.totalPkr,
      status: orders.status,
      createdAt: orders.createdAt,
      userId: orders.userId,
      guestPhone: orders.guestPhone,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(5);

  // Get customer names for orders with userId
  const userIds = recentOrders
    .map((o) => o.userId)
    .filter((id): id is string => id !== null);

  let userMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const orderUsers = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(sql`${users.id} in ${userIds}`);
    userMap = Object.fromEntries(
      orderUsers.map((u) => [u.id, u.name || "Unknown"])
    );
  }

  // Low stock items with product/variant names
  const lowStockItems = await db
    .select({
      variantId: inventory.variantId,
      quantityOnHand: inventory.quantityOnHand,
      quantityReserved: inventory.quantityReserved,
      productName: products.nameEn,
      color: productVariants.color,
      size: productVariants.size,
    })
    .from(inventory)
    .innerJoin(productVariants, eq(inventory.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      sql`${inventory.quantityOnHand} - ${inventory.quantityReserved} <= ${inventory.lowStockThreshold}`
    )
    .orderBy(
      sql`${inventory.quantityOnHand} - ${inventory.quantityReserved}`
    )
    .limit(5);

  return {
    totalOrders: orderStats?.count ?? 0,
    revenue: Number(revenueStats?.revenue ?? 0),
    pipeline: Number(pipelineStats?.pipeline ?? 0),
    pipelineCount: pipelineStats?.count ?? 0,
    totalProducts: productCount?.count ?? 0,
    activeUsers: userCount?.count ?? 0,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      customerName: o.userId
        ? userMap[o.userId] || "Unknown"
        : o.guestPhone || "Guest",
    })),
    lowStockItems: lowStockItems.map((item) => ({
      ...item,
      available:
        (item.quantityOnHand ?? 0) - (item.quantityReserved ?? 0),
    })),
  };
}

function formatPkr(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader title="Dashboard" />

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-5 gap-4">
        <StatCard
          icon={Banknote}
          color="blue"
          value={formatPkr(data.revenue)}
          label="Revenue (collected)"
        />
        <StatCard
          icon={Hourglass}
          color="amber"
          value={formatPkr(data.pipeline)}
          label={`Pipeline · ${data.pipelineCount} in flight`}
        />
        <StatCard
          icon={ShoppingBag}
          color="emerald"
          value={data.totalOrders.toLocaleString()}
          label="Total Orders"
        />
        <StatCard
          icon={Package}
          color="purple"
          value={data.totalProducts.toLocaleString()}
          label="Products"
        />
        <StatCard
          icon={Users}
          color="cyan"
          value={data.activeUsers.toLocaleString()}
          label="Active Users"
        />
      </div>

      {/* Bottom section: Recent Orders + Low Stock */}
      <div className="grid grid-cols-[2.5fr_1fr] gap-5">
        {/* Recent Orders */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Recent Orders</h2>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Order #
                </TableHead>
                <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Customer
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
              {data.recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No orders yet
                  </TableCell>
                </TableRow>
              ) : (
                data.recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-border/50"
                  >
                    <TableCell className="text-[13px] font-medium text-foreground">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {order.customerName}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {formatPkr(Number(order.totalPkr))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Low Stock Alerts</h2>
          <div className="flex flex-col gap-3.5">
            {data.lowStockItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                All stock levels healthy
              </p>
            ) : (
              data.lowStockItems.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="text-[13px] font-medium text-foreground">
                      {item.productName}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {[item.color, item.size].filter(Boolean).join(" / ")}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      item.available <= 1
                        ? "bg-red-500/15 text-red-500"
                        : "bg-amber-500/15 text-amber-500"
                    }`}
                  >
                    {item.available} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
