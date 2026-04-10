import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, sql, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { flashSales, flashSaleProducts } from "@/lib/db/schema/marketing";
import { products } from "@/lib/db/schema/catalog";
import { BackLink } from "../../../_components/back-link";
import { PageHeader } from "../../../_components/page-header";
import { SaleProducts } from "../_components/sale-products";
import { Pencil } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

function getSaleStatus(sale: { startsAt: Date; endsAt: Date; isActive: boolean }) {
  if (!sale.isActive) return { label: "Inactive", color: "bg-zinc-500/15 text-zinc-400" };
  const now = new Date();
  if (now < new Date(sale.startsAt)) return { label: "Scheduled", color: "bg-cyan-500/15 text-cyan-500" };
  if (now > new Date(sale.endsAt)) return { label: "Ended", color: "bg-zinc-500/15 text-zinc-400" };
  return { label: "Active", color: "bg-emerald-500/15 text-emerald-500" };
}

export default async function FlashSaleDetailPage({ params }: Props) {
  const { id } = await params;

  const [sale] = await db
    .select()
    .from(flashSales)
    .where(eq(flashSales.id, id))
    .limit(1);

  if (!sale) notFound();

  const saleProducts = await db
    .select({
      id: flashSaleProducts.id,
      productId: flashSaleProducts.productId,
      productName: products.nameEn,
      overridePricePkr: flashSaleProducts.overridePricePkr,
      stockLimit: flashSaleProducts.stockLimit,
      unitsSold: flashSaleProducts.unitsSold,
    })
    .from(flashSaleProducts)
    .innerJoin(products, eq(flashSaleProducts.productId, products.id))
    .where(eq(flashSaleProducts.flashSaleId, id));

  const allProducts = await db
    .select({ id: products.id, nameEn: products.nameEn })
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.isPublished, true)))
    .orderBy(products.nameEn);

  const status = getSaleStatus(sale);

  const serializedProducts = saleProducts.map((p) => ({
    ...p,
    overridePricePkr: p.overridePricePkr,
    stockLimit: p.stockLimit,
    unitsSold: p.unitsSold,
  }));

  return (
    <>
      <BackLink href="/admin/flash-sales" label="Back to Flash Sales" />
      <PageHeader title={sale.name}>
        <Link
          href={`/admin/flash-sales/${id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" /> Edit
        </Link>
      </PageHeader>

      {/* Sale details card */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Discount
            </p>
            <p className="mt-1 text-[13px] font-medium text-foreground">
              {sale.discountType === "percentage"
                ? `${sale.discountValue}% off`
                : `Rs. ${Number(sale.discountValue).toLocaleString("en-PK")} flat`}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Starts
            </p>
            <p className="mt-1 text-[13px] text-foreground">
              {new Date(sale.startsAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Ends
            </p>
            <p className="mt-1 text-[13px] text-foreground">
              {new Date(sale.endsAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <p className="mt-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.color}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {status.label}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Products section */}
      <h2 className="mb-4 text-lg font-semibold text-foreground">Sale Products</h2>
      <SaleProducts
        saleId={id}
        products={serializedProducts}
        allProducts={allProducts}
      />
    </>
  );
}
