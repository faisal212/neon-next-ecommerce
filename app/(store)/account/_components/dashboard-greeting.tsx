import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dynamic island: user's first name in the welcome heading.
 * Streams in behind <DashboardGreetingSkeleton /> via Suspense.
 */
export async function DashboardGreeting() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // DB not connected — degrade gracefully
  }

  // Proxy.ts already blocked unauthenticated requests at the edge, but the
  // cookie may be expired/invalid. Defense-in-depth redirect.
  if (!user) {
    redirect("/auth/login?callbackUrl=/account");
  }

  // Greet by first name only — friendlier than full name.
  const displayName = user.firstName ?? "there";

  return (
    <h1 className="text-2xl font-bold tracking-tight">
      Welcome back, {displayName}!
    </h1>
  );
}

export function DashboardGreetingSkeleton() {
  return (
    <div style={{ height: 32 }} className="flex items-center">
      <Skeleton className="h-7 w-64 bg-surface-container" />
    </div>
  );
}
