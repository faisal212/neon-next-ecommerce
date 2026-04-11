import { sql, desc, eq, and, gte, ne, or, isNull, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, codCollections, orderStatusHistory } from "@/lib/db/schema/orders";
import { sessions, dailyProductStats, dailyTrafficStats } from "@/lib/db/schema/analytics";
import { products } from "@/lib/db/schema/catalog";
import { PageHeader } from "../../_components/page-header";
import { StatCard } from "../../_components/stat-card";
import {
  Eye,
  ShoppingBag,
  Banknote,
  Hourglass,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { RunAggregationButton } from "./_components/run-aggregation";
import { PeriodTabs } from "./_components/period-tabs";
import { parsePeriod, periodSince } from "@/lib/utils/period";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Threshold for the "team is behind on COD reconciliation" callout. Couriers
// usually remit within 24–48 hours, so >3 days almost always means an admin
// forgot to record the collection. Tune by editing this constant.
const STALE_COD_DAYS = 3;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);
  const since = periodSince(period);
  // For `date`-typed columns (daily_*_stats.statDate), drizzle compares
  // against ISO date strings rather than JS Date objects.
  const sinceDateStr = since ? since.toISOString().slice(0, 10) : null;

  // ── Revenue (cash-basis) ────────────────────────────────────────────
  // Only money actually collected. The dashboard uses the same query.
  const [revenueStats] = await db
    .select({
      revenue: sql<string>`coalesce(sum(${codCollections.amountCollectedPkr}), 0)`,
    })
    .from(codCollections)
    .where(
      and(
        eq(codCollections.status, "collected"),
        since ? gte(codCollections.collectedAt, since) : undefined,
      ),
    );

  // ── Pipeline ────────────────────────────────────────────────────────
  // In-flight orders, including delivered-but-not-yet-collected. Excludes
  // cancelled/returned (no money owed) and orders whose COD has already
  // been collected (counted as Revenue above).
  const [pipelineStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
      pipeline: sql<string>`coalesce(sum(${orders.totalPkr}), 0)`,
    })
    .from(orders)
    .leftJoin(codCollections, eq(codCollections.orderId, orders.id))
    .where(
      and(
        notInArray(orders.status, ["cancelled", "returned"]),
        or(
          isNull(codCollections.status),
          ne(codCollections.status, "collected"),
        ),
        since ? gte(orders.createdAt, since) : undefined,
      ),
    );

  // ── Loss rate (cancelled + returned %) ──────────────────────────────
  // Single query, conditional aggregation in SQL.
  const [lossStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      lost: sql<number>`count(*) FILTER (WHERE ${orders.status} IN ('cancelled', 'returned'))::int`,
    })
    .from(orders)
    .where(since ? gte(orders.createdAt, since) : undefined);

  const lossRate =
    lossStats && lossStats.total > 0
      ? ((lossStats.lost / lossStats.total) * 100).toFixed(1)
      : null;

  // ── Period-scoped order + session counts ────────────────────────────
  const [orderCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(since ? gte(orders.createdAt, since) : undefined);

  const [sessionCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sessions)
    .where(since ? gte(sessions.startedAt, since) : undefined);

  // ── Stale COD callout ───────────────────────────────────────────────
  // Find candidate orders (delivered + cod pending) and join the
  // accurate "delivered_at" via a subquery against order_status_history.
  // The 3-day threshold filter is applied in JS for clarity — the
  // candidate set is small (delivered orders awaiting COD only).
  // NOT period-scoped: staleness is an absolute condition, hiding it
  // behind a date filter would mask real reconciliation problems.
  const staleCandidates = await db
    .select({
      orderId: orders.id,
      deliveredAt: sql<string | Date | null>`(
        SELECT MAX(${orderStatusHistory.createdAt})
        FROM ${orderStatusHistory}
        WHERE ${orderStatusHistory.orderId} = ${orders.id}
          AND ${orderStatusHistory.status} = 'delivered'
      )`,
    })
    .from(orders)
    .innerJoin(codCollections, eq(codCollections.orderId, orders.id))
    .where(
      and(
        eq(orders.status, "delivered"),
        eq(codCollections.status, "pending"),
      ),
    );

  const thresholdMs = Date.now() - STALE_COD_DAYS * 24 * 60 * 60 * 1000;
  const stale = staleCandidates
    .map((o) => ({
      orderId: o.orderId,
      deliveredAtMs: o.deliveredAt ? new Date(o.deliveredAt).getTime() : null,
    }))
    .filter(
      (o): o is { orderId: string; deliveredAtMs: number } =>
        o.deliveredAtMs !== null && o.deliveredAtMs < thresholdMs,
    );
  const staleCount = stale.length;
  const oldestStaleDays =
    staleCount > 0
      ? Math.floor(
          (Date.now() - Math.min(...stale.map((s) => s.deliveredAtMs))) /
            (24 * 60 * 60 * 1000),
        )
      : 0;

  // ── Top products by revenue (period-scoped via stat_date) ───────────
  const topProducts = await db
    .select({
      productId: dailyProductStats.productId,
      views: sql<number>`sum(${dailyProductStats.views})::int`,
      ordersCount: sql<number>`sum(${dailyProductStats.ordersCount})::int`,
      revenue: sql<string>`sum(${dailyProductStats.revenuePkr})`,
      productName: products.nameEn,
    })
    .from(dailyProductStats)
    .innerJoin(products, eq(dailyProductStats.productId, products.id))
    .where(
      sinceDateStr ? gte(dailyProductStats.statDate, sinceDateStr) : undefined,
    )
    .groupBy(dailyProductStats.productId, products.nameEn)
    .orderBy(desc(sql`sum(${dailyProductStats.revenuePkr})`))
    .limit(5);

  // ── Traffic sources (period-scoped via stat_date) ───────────────────
  const trafficSources = await db
    .select({
      utmSource: dailyTrafficStats.utmSource,
      sessionsCount: sql<number>`sum(${dailyTrafficStats.sessionsCount})::int`,
      ordersCount: sql<number>`sum(${dailyTrafficStats.ordersCount})::int`,
      revenue: sql<string>`sum(${dailyTrafficStats.revenuePkr})`,
    })
    .from(dailyTrafficStats)
    .where(
      sinceDateStr ? gte(dailyTrafficStats.statDate, sinceDateStr) : undefined,
    )
    .groupBy(dailyTrafficStats.utmSource)
    .orderBy(desc(sql`sum(${dailyTrafficStats.sessionsCount})`))
    .limit(5);

  return (
    <>
      <PageHeader title="Analytics">
        <PeriodTabs active={period} />
        <RunAggregationButton />
      </PageHeader>

      <div className="mb-6 grid grid-cols-5 gap-4">
        <StatCard
          icon={Banknote}
          color="blue"
          value={`Rs. ${Number(revenueStats?.revenue ?? 0).toLocaleString("en-PK")}`}
          label="Revenue (collected)"
        />
        <StatCard
          icon={Hourglass}
          color="amber"
          value={`Rs. ${Number(pipelineStats?.pipeline ?? 0).toLocaleString("en-PK")}`}
          label={`Pipeline · ${pipelineStats?.count ?? 0} in flight`}
        />
        <StatCard
          icon={TrendingDown}
          color="red"
          value={lossRate !== null ? `${lossRate}%` : "—"}
          label="Loss rate (cancelled + returned)"
        />
        <StatCard
          icon={ShoppingBag}
          color="emerald"
          value={(orderCount?.count ?? 0).toLocaleString()}
          label="Orders"
        />
        <StatCard
          icon={Eye}
          color="cyan"
          value={(sessionCount?.count ?? 0).toLocaleString()}
          label="Sessions"
        />
      </div>

      {staleCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
          <div className="flex-1 text-[13px]">
            <span className="font-medium text-amber-400">
              {staleCount} order{staleCount === 1 ? "" : "s"} waiting for COD reconciliation
            </span>
            <span className="text-zinc-400">
              {" "}— oldest is {oldestStaleDays} day{oldestStaleDays === 1 ? "" : "s"} old. Record collections via /admin/orders.
            </span>
          </div>
        </div>
      )}

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
                    No data in this period — run aggregation if storefront tracking is live
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
                    No data in this period — run aggregation if storefront tracking is live
                  </TableCell>
                </TableRow>
              ) : (
                trafficSources.map((t) => (
                  <TableRow
                    key={t.utmSource ?? "direct"}
                    className="border-border/50"
                  >
                    <TableCell className="text-[13px] font-medium text-foreground">
                      {t.utmSource || "Direct"}
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-muted-foreground">
                      {(t.sessionsCount ?? 0).toLocaleString()}
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
