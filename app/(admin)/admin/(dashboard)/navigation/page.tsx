import Link from "next/link";
import { listNavMenuItems } from "@/lib/services/nav-menu.service";
import { PageHeader } from "../../_components/page-header";
import { Plus } from "lucide-react";
import { NavItemsTable } from "./_components/nav-items-table";

export default async function NavigationPage() {
  const items = await listNavMenuItems();

  const serialized = items.map((item) => ({
    id: item.id,
    label: item.label,
    type: item.type,
    href: item.href,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    openInNewTab: item.openInNewTab,
  }));

  return (
    <>
      <PageHeader title="Navigation">
        <Link
          href="/admin/navigation/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Item
        </Link>
      </PageHeader>

      <NavItemsTable data={serialized} />
    </>
  );
}
