"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await authClient.signOut();
      // Storefront doesn't gate the homepage behind auth, so bounce there.
      // router.refresh() ensures the layout re-runs with no session and any
      // server-rendered "Welcome back, Name" strings are dropped.
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {signingOut ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <LogOut size={18} />
      )}
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
