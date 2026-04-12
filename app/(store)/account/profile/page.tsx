import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import {
  ProfileDetails,
  ProfileDetailsSkeleton,
} from "./_components/profile-details";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and manage your profile information.",
};

export default function ProfilePage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Profile" },
        ]}
      />

      <h1 className="mt-6 text-2xl font-bold tracking-tight">My Profile</h1>
      <p className="mt-1 text-on-surface-variant">
        Your personal information and account details.
      </p>

      <Suspense fallback={<ProfileDetailsSkeleton />}>
        <ProfileDetails />
      </Suspense>

      {/* Placeholder edit notice — fully static */}
      <div className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container-low p-5 text-center">
        <p className="text-sm text-on-surface-variant">
          To update your profile information, please contact our{" "}
          <a
            href="/account/support"
            className="font-bold text-primary hover:underline"
          >
            support team
          </a>
          .
        </p>
      </div>
    </div>
  );
}
