import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { flashSales } from "@/lib/db/schema/marketing";
import { BackLink } from "../../../../_components/back-link";
import { PageHeader } from "../../../../_components/page-header";
import { FlashSaleForm } from "../../_components/flash-sale-form";

interface Props {
  params: Promise<{ id: string }>;
}

function toLocalDatetimeValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default async function EditFlashSalePage({ params }: Props) {
  const { id } = await params;

  const [sale] = await db
    .select()
    .from(flashSales)
    .where(eq(flashSales.id, id))
    .limit(1);

  if (!sale) notFound();

  return (
    <>
      <BackLink href={`/admin/flash-sales/${id}`} label="Back to Sale" />
      <PageHeader title="Edit Flash Sale" />
      <FlashSaleForm
        initialData={{
          id: sale.id,
          name: sale.name,
          discountType: sale.discountType,
          discountValue: sale.discountValue,
          startsAt: toLocalDatetimeValue(sale.startsAt),
          endsAt: toLocalDatetimeValue(sale.endsAt),
          isActive: sale.isActive,
        }}
      />
    </>
  );
}
