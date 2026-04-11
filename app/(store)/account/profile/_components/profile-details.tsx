import { redirect } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/services/user.service";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dynamic island: the user's profile details (name, email, phone, status).
 * Pulls both the session user and the full user row so the "member since"
 * date and latest profile fields are accurate.
 */
export async function ProfileDetails() {
  let authUser = null;
  try {
    authUser = await getCurrentUser();
  } catch {
    // DB not connected
  }
  if (!authUser) {
    redirect("/auth/login?callbackUrl=/account/profile");
  }

  let fullUser: Awaited<ReturnType<typeof getUserById>> | null = null;
  try {
    fullUser = await getUserById(authUser.id);
  } catch {
    // DB not connected
  }

  const firstName = fullUser?.firstName ?? authUser.firstName ?? "";
  const lastName = fullUser?.lastName ?? authUser.lastName ?? "";
  const name = `${firstName} ${lastName}`.trim() || "Unknown";
  const email = fullUser?.email ?? authUser.email ?? "Not available";
  const phone = fullUser?.phonePk ?? authUser.phonePk ?? null;
  const isPhoneVerified =
    fullUser?.isPhoneVerified ?? authUser.isPhoneVerified ?? false;
  const memberSince = fullUser?.createdAt
    ? new Date(fullUser.createdAt).toLocaleDateString("en-PK", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      {/* Profile card */}
      <div className="mt-8 rounded-lg border border-outline-variant/10 bg-surface-container p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <User size={28} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{name}</h2>
            {memberSince && (
              <p className="text-sm text-on-surface-variant">
                Member since {memberSince}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container">
        <div className="border-b border-outline-variant/10 p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Personal Information
          </h3>
        </div>

        <div className="divide-y divide-outline-variant/10">
          {/* Name */}
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest">
              <User size={18} className="text-on-surface-variant" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-on-surface-variant">Full Name</p>
              <p className="mt-0.5 text-sm font-bold">{name}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest">
              <Mail size={18} className="text-on-surface-variant" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-on-surface-variant">Email Address</p>
              <p className="mt-0.5 text-sm font-bold">{email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest">
              <Phone size={18} className="text-on-surface-variant" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-on-surface-variant">Phone Number</p>
              <p className="mt-0.5 text-sm font-bold">
                {phone ?? "Not provided"}
              </p>
            </div>
            <div>
              {phone ? (
                isPhoneVerified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-bold text-green-400">
                    <CheckCircle2 size={12} />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary/20 px-2.5 py-0.5 text-xs font-bold text-tertiary">
                    <AlertCircle size={12} />
                    Unverified
                  </span>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Account status */}
      <div className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container">
        <div className="border-b border-outline-variant/10 p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Account Status
          </h3>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest">
              <Shield size={18} className="text-on-surface-variant" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-on-surface-variant">Status</p>
              <p className="mt-0.5 text-sm font-bold">
                {authUser.isActive !== false ? "Active" : "Deactivated"}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                authUser.isActive !== false
                  ? "bg-green-500/20 text-green-400"
                  : "bg-destructive/20 text-destructive"
              }`}
            >
              {authUser.isActive !== false ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export function ProfileDetailsSkeleton() {
  return (
    <>
      {/* Profile card skeleton */}
      <div
        className="mt-8 rounded-lg border border-outline-variant/10 bg-surface-container p-6"
        style={{ minHeight: 104 }}
      >
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full bg-surface-container-high" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40 bg-surface-container-high" />
            <Skeleton className="h-4 w-32 bg-surface-container-high" />
          </div>
        </div>
      </div>

      {/* Personal info skeleton */}
      <div
        className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container"
        style={{ minHeight: 280 }}
      >
        <div className="border-b border-outline-variant/10 p-5">
          <Skeleton className="h-4 w-40 bg-surface-container-high" />
        </div>
        <div className="divide-y divide-outline-variant/10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 p-5">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg bg-surface-container-high" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-24 bg-surface-container-high" />
                <Skeleton className="h-4 w-40 bg-surface-container-high" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account status skeleton */}
      <div
        className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container"
        style={{ minHeight: 120 }}
      >
        <div className="border-b border-outline-variant/10 p-5">
          <Skeleton className="h-4 w-32 bg-surface-container-high" />
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg bg-surface-container-high" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-16 bg-surface-container-high" />
              <Skeleton className="h-4 w-20 bg-surface-container-high" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full bg-surface-container-high" />
          </div>
        </div>
      </div>
    </>
  );
}
