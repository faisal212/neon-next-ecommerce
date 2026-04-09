import Link from "next/link";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema/marketing";
import { PageHeader } from "../../_components/page-header";
import { Plus } from "lucide-react";
import { BannersTable } from "./_components/banners-table";

export default async function BannersPage() {
  const allBanners = await db
    .select()
    .from(banners)
    .orderBy(banners.sortOrder);

  const serialized = allBanners.map((b) => ({
    id: b.id,
    title: b.title,
    imageUrl: b.imageUrl,
    placement: b.placement,
    targetProvince: b.targetProvince,
    sortOrder: b.sortOrder,
    isActive: b.isActive,
    startsAt: b.startsAt ? b.startsAt.toISOString() : null,
    endsAt: b.endsAt ? b.endsAt.toISOString() : null,
  }));

  return (
    <>
      <PageHeader title="Banners">
        <Link
          href="/admin/banners/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </Link>
      </PageHeader>

      <BannersTable data={serialized} />
    </>
  );
}
