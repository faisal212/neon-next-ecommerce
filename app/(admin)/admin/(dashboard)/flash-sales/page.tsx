import Link from "next/link";
import { db } from "@/lib/db";
import { flashSales } from "@/lib/db/schema/marketing";
import { sql } from "drizzle-orm";
import { PageHeader } from "../../_components/page-header";
import { Plus } from "lucide-react";
import { FlashSalesTable } from "./_components/flash-sales-table";

export default async function FlashSalesPage() {
  const sales = await db
    .select({
      id: flashSales.id,
      name: flashSales.name,
      discountType: flashSales.discountType,
      discountValue: flashSales.discountValue,
      startsAt: flashSales.startsAt,
      endsAt: flashSales.endsAt,
      isActive: flashSales.isActive,
      productCount: sql<number>`(SELECT count(*)::int FROM flash_sale_products WHERE flash_sale_id = ${flashSales.id})`,
    })
    .from(flashSales)
    .orderBy(flashSales.startsAt);

  const serialized = sales.map((s) => ({
    ...s,
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="Flash Sales">
        <Link
          href="/admin/flash-sales/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Create Flash Sale
        </Link>
      </PageHeader>

      <FlashSalesTable data={serialized} />
    </>
  );
}
