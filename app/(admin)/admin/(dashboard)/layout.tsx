import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "../_components/sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar admin={{ name: admin.name, role: admin.role }} />
      <main className="ml-[260px] h-screen flex-1 overflow-y-auto px-10 py-8">
        {children}
      </main>
    </div>
  );
}
