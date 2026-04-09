import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema/users";
import { PageHeader } from "../../_components/page-header";
import { AdminUsersTable } from "./_components/admin-users-table";

export default async function AdminUsersPage() {
  const adminList = await db
    .select()
    .from(adminUsers)
    .orderBy(desc(adminUsers.createdAt));

  const serialized = adminList.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    isActive: a.isActive,
    lastLoginAt: a.lastLoginAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Admin Users"
        subtitle={`${serialized.length} admin user${serialized.length !== 1 ? "s" : ""}`}
      />
      <AdminUsersTable data={serialized} />
    </>
  );
}
