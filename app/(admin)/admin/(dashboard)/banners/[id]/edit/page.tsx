import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema/marketing";
import { BackLink } from "../../../../_components/back-link";
import { PageHeader } from "../../../../_components/page-header";
import { BannerForm } from "../../_components/banner-form";

interface Props {
  params: Promise<{ id: string }>;
}

function toLocalDatetimeValue(date: Date | null): string {
  if (!date) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params;

  const [banner] = await db
    .select()
    .from(banners)
    .where(eq(banners.id, id))
    .limit(1);

  if (!banner) notFound();

  return (
    <>
      <BackLink href="/admin/banners" label="Back to Banners" />
      <PageHeader title={`Edit: ${banner.title}`} />
      <BannerForm
        initialData={{
          id: banner.id,
          title: banner.title,
          titleHighlight: banner.titleHighlight || "",
          subtitle: banner.subtitle || "",
          description: banner.description || "",
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl || "",
          placement: banner.placement,
          targetProvince: banner.targetProvince || "",
          sortOrder: banner.sortOrder,
          isActive: banner.isActive,
          startsAt: toLocalDatetimeValue(banner.startsAt),
          endsAt: toLocalDatetimeValue(banner.endsAt),
        }}
      />
    </>
  );
}
