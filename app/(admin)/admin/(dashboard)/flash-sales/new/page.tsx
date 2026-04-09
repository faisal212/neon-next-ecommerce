import { BackLink } from "../../../_components/back-link";
import { PageHeader } from "../../../_components/page-header";
import { FlashSaleForm } from "../_components/flash-sale-form";

export default function NewFlashSalePage() {
  return (
    <>
      <BackLink href="/admin/flash-sales" label="Back to Flash Sales" />
      <PageHeader title="Create Flash Sale" />
      <FlashSaleForm />
    </>
  );
}
