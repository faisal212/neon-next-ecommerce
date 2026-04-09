import { notFound } from "next/navigation";
import { getNavMenuItemById } from "@/lib/services/nav-menu.service";
import { BackLink } from "../../../../_components/back-link";
import { PageHeader } from "../../../../_components/page-header";
import { NavItemForm } from "../../_components/nav-item-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditNavItemPage({ params }: Props) {
  const { id } = await params;

  let item;
  try {
    item = await getNavMenuItemById(id);
  } catch {
    notFound();
  }

  return (
    <>
      <BackLink href="/admin/navigation" label="Back to Navigation" />
      <PageHeader title={`Edit: ${item.label}`} />
      <NavItemForm
        initialData={{
          id: item.id,
          label: item.label,
          type: item.type,
          categoryId: item.categoryId,
          href: item.href,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
          openInNewTab: item.openInNewTab,
        }}
      />
    </>
  );
}
