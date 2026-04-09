import { BackLink } from "../../../_components/back-link";
import { PageHeader } from "../../../_components/page-header";
import { BannerForm } from "../_components/banner-form";

export default function NewBannerPage() {
  return (
    <>
      <BackLink href="/admin/banners" label="Back to Banners" />
      <PageHeader title="Add Banner" />
      <BannerForm />
    </>
  );
}
