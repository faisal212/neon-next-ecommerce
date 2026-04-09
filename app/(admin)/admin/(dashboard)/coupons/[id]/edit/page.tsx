import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema/orders";
import { BackLink } from "../../../../_components/back-link";
import { PageHeader } from "../../../../_components/page-header";
import { CouponForm } from "../../_components/coupon-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);

  if (!coupon) notFound();

  return (
    <>
      <BackLink href="/admin/coupons" label="Back to Coupons" />
      <PageHeader title="Edit Coupon" />
      <CouponForm
        initialData={{
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderPkr: coupon.minOrderPkr,
          maxDiscountPkr: coupon.maxDiscountPkr || "",
          maxUses: coupon.maxUses,
          expiresAt: coupon.expiresAt
            ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
            : "",
          isActive: coupon.isActive,
        }}
      />
    </>
  );
}
