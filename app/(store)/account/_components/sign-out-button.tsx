"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await authClient.signOut();
      // Hard redirect instead of router.push() + router.refresh().
      // A soft navigation leaves the Next.js router cache and the Neon Auth
      // session cookie in a transitional state, causing the very next signIn
      // call to fail on first attempt. window.location.replace() forces a full
      // page reload which flushes all cookie writes and clears client state.
      window.location.replace("/");
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
