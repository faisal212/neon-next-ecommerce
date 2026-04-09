import { db } from "@/lib/db";
import { notificationTemplates } from "@/lib/db/schema/support";
import { PageHeader } from "../../_components/page-header";
import { TemplatesClient } from "./_components/templates-client";

export default async function NotificationsPage() {
  const templates = await db
    .select()
    .from(notificationTemplates)
    .orderBy(notificationTemplates.key);

  const serialized = templates.map((t) => ({
    ...t,
    updatedAt: t.updatedAt.toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Notification Templates"
        subtitle="Manage SMS, email, and push notification templates"
      />
      <TemplatesClient templates={serialized} />
    </>
  );
}
