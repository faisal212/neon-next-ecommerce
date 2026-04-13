import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AuthenticationError, ForbiddenError } from "@/lib/errors/api-error";
import { Sidebar } from "../_components/sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLayoutSkeleton />}>
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </Suspense>
  );
}

async function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    // No session at all → send to login
    if (err instanceof AuthenticationError) {
      redirect("/admin/login");
    }
    // Authenticated but not an admin → show an inline forbidden page
    // (no redirect loop, clear messaging)
    if (err instanceof ForbiddenError) {
      return <AccessDenied />;
    }
    // Anything unexpected — failsafe to login
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

function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldOff size={28} className="text-destructive" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Access Denied
        </h1>
        <p className="mt-3 text-on-surface-variant">
          Your account doesn&apos;t have permission to access the admin panel.
          If you believe this is a mistake, contact the store owner.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-on-primary-fixed transition-opacity hover:opacity-90"
          >
            <ArrowLeft size={16} />
            Back to Store
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container px-6 py-3 text-sm font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container-high"
          >
            Sign in as Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminLayoutSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="h-screen w-[260px] shrink-0 bg-surface-container-low" />
      <div className="flex-1" />
    </div>
  );
}
