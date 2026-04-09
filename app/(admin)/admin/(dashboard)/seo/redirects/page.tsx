import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { urlRedirects } from "@/lib/db/schema/seo";
import { PageHeader } from "../../../_components/page-header";
import { BackLink } from "../../../_components/back-link";
import { RedirectsClient } from "./_components/redirects-client";

export default async function RedirectsPage() {
  const redirectList = await db
    .select()
    .from(urlRedirects)
    .orderBy(desc(urlRedirects.createdAt));

  const serialized = redirectList.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <>
      <BackLink href="/admin/seo" label="SEO Management" />
      <PageHeader title="URL Redirects" subtitle="Manage 301/302 redirects" />
      <RedirectsClient redirects={serialized} />
    </>
  );
}
