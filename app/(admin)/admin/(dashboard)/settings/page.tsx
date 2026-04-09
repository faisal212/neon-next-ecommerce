import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema/support";
import { PageHeader } from "../../_components/page-header";
import { SettingsTable } from "./_components/settings-table";

export default async function SettingsPage() {
  const settings = await db.select().from(appSettings).orderBy(appSettings.key);

  const serialized = settings.map((s) => ({
    id: s.id,
    key: s.key,
    value: JSON.stringify(s.value),
    description: s.description,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="App Settings" subtitle="Super Admin only" />
      <SettingsTable settings={serialized} />
    </>
  );
}
