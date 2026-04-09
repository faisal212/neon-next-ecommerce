import Link from "next/link";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema/orders";
import { desc } from "drizzle-orm";
import { PageHeader } from "../../_components/page-header";
import { Plus } from "lucide-react";
import { CouponsTable } from "./_components/coupons-table";

export default async function CouponsPage() {
  const allCoupons = await db
    .select()
    .from(coupons)
    .orderBy(desc(coupons.isActive));

  const now = new Date();

  const serialized = allCoupons.map((c) => {
    let status: string;

    if (!c.isActive) {
      status = "Inactive";
    } else if (c.expiresAt && new Date(c.expiresAt) < now) {
      status = "Expired";
    } else if (c.maxUses && c.usesCount >= c.maxUses) {
      status = "Limit Reached";
    } else {
      status = "Active";
    }

    return {
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderPkr: c.minOrderPkr,
      maxDiscountPkr: c.maxDiscountPkr,
      maxUses: c.maxUses,
      usesCount: c.usesCount,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      isActive: c.isActive,
      status,
    };
  });

  return (
    <>
      <PageHeader title="Coupons">
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" /> Add Coupon
        </Link>
      </PageHeader>

      <CouponsTable data={serialized} />
    </>
  );
}
