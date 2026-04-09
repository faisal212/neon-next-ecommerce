import { sql, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import { sessions } from "@/lib/db/schema/analytics";
import { dailyProductStats, dailyTrafficStats } from "@/lib/db/schema/analytics";
import { products } from "@/lib/db/schema/catalog";
import { PageHeader } from "../../_components/page-header";
import { StatCard } from "../../_components/stat-card";
import { Eye, ShoppingBag, Banknote, Percent } from "lucide-react";
import { RunAggregationButton } from "./_components/run-aggregation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AnalyticsPage() {
  const [orderStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
      revenue: sql<string>`coalesce(sum(${orders.totalPkr}), 0)`,
    })
    .from(orders);

  const [sessionCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sessions);

  const totalOrders = orderStats?.count ?? 0;
  const totalSessions = sessionCount?.count ?? 0;
  const conversionRate =
    totalSessions > 0
      ? ((totalOrders / totalSessions) * 100).toFixed(2)
      : "0.00";

  // Top products by revenue
  const topProducts = await db
    .select({
      productId: dailyProductStats.productId,
      views: sql<number>`sum(${dailyProductStats.views})::int`,
      ordersCount: sql<number>`sum(${dailyProductStats.ordersCount})::int`,
      revenue: sql<string>`sum(${dailyProductStats.revenuePkr})`,
      productName: products.nameEn,
    })
    .from(dailyProductStats)
    .innerJoin(products, sql`${dailyProductStats.productId} = ${products.id}`)
    .groupBy(dailyProductStats.productId, products.nameEn)
    .orderBy(desc(sql`sum(${dailyProductStats.revenuePkr})`))
    .limit(5);

  // Traffic by source
  const trafficSources = await db
    .select({
      utmSource: dailyTrafficStats.utmSource,
      sessions: sql<number>`sum(${dailyTrafficStats.sessionsCount})::int`,
      ordersCount: sql<number>`sum(${dailyTrafficStats.ordersCount})::int`,
      revenue: sql<string>`sum(${dailyTrafficStats.revenuePkr})`,
    })
    .from(dailyTrafficStats)
    .groupBy(dailyTrafficStats.utmSource)
    .orderBy(desc(sql`sum(${dailyTrafficStats.sessionsCount})`))
    .limit(5);

  return (
    <>
      <PageHeader title="Analytics" />

      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          color="cyan"
          value={totalSessions.toLocaleString()}
          label="Sessions"
        />
        <StatCard
          icon={ShoppingBag}
          color="emerald"
          value={totalOrders.toLocaleString()}
          label="Orders"
        />
        <StatCard
          icon={Banknote}
          color="blue"
          value={`Rs. ${Number(orderStats?.revenue ?? 0).toLocaleString("en-PK")}`}
          label="Revenue"
        />
        <StatCard
          icon={Percent}
          color="purple"
          value={`${conversionRate}%`}
          label="Conversion Rate"
        />
      </div>

      <div className="mb-6">
        <RunAggregationButton />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Top Products by Revenue</h3>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Product
                </TableHead>
                <TableHead className="text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Views
                </TableHead>
                <TableHead className="text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Orders
                </TableHead>
                <TableHead className="text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Revenue
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No data yet — run aggregation first
                  </TableCell>
                </TableRow>
              ) : (
                topProducts.map((p) => (
                  <TableRow key={p.productId} className="border-border/50">
                    <TableCell className="text-[13px] font-medium text-foreground">
                      {p.productName}
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-muted-foreground">
                      {(p.views ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-muted-foreground">
                      {(p.ordersCount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-muted-foreground">
                      Rs. {Number(p.revenue ?? 0).toLocaleString("en-PK")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Traffic Sources */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Traffic Sources</h3>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Source
                </TableHead>
                <TableHead className="text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Sessions
                </TableHead>
                <TableHead className="text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Orders
                </TableHead>
                <TableHead className="text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Revenue
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trafficSources.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No data yet — run aggregation first
                  </TableCell>
                </TableRow>
              ) : (
                trafficSources.map((t) => (
                  <TableRow key={t.utmSource} className="border-border/50">
                    <TableCell className="text-[13px] font-medium text-foreground">
                      {t.utmSource || "Direct"}
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-muted-foreground">
                      {(t.sessions ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-muted-foreground">
                      {(t.ordersCount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-muted-foreground">
                      Rs. {Number(t.revenue ?? 0).toLocaleString("en-PK")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
