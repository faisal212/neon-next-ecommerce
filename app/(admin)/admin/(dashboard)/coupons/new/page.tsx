import { BackLink } from "../../../_components/back-link";
import { PageHeader } from "../../../_components/page-header";
import { CouponForm } from "../_components/coupon-form";

export default function NewCouponPage() {
  return (
    <>
      <BackLink href="/admin/coupons" label="Back to Coupons" />
      <PageHeader title="Add Coupon" />
      <CouponForm />
    </>
  );
}
