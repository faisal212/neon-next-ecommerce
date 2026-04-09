import { BackLink } from "../../../_components/back-link";
import { PageHeader } from "../../../_components/page-header";
import { NavItemForm } from "../_components/nav-item-form";

export default function NewNavItemPage() {
  return (
    <>
      <BackLink href="/admin/navigation" label="Back to Navigation" />
      <PageHeader title="Add Navigation Item" />
      <NavItemForm />
    </>
  );
}
