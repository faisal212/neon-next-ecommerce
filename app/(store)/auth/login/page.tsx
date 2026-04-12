import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { LogIn } from "lucide-react";

import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

// Skeleton matches the form dimensions (2 inputs + button) so the static
// shell prerenders without layout shift while LoginForm streams in.
function LoginFormFallback() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-3 w-12 rounded-sm bg-surface-container-highest/60" />
        <div className="h-11 w-full rounded-sm bg-surface-container-highest/40" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-16 rounded-sm bg-surface-container-highest/60" />
        <div className="h-11 w-full rounded-sm bg-surface-container-highest/40" />
      </div>
      <div className="h-14 w-full rounded-lg bg-surface-container-highest/40" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-surface-container-highest rounded-xl flex items-center justify-center mx-auto mb-6">
            <LogIn size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2">
            Welcome Back
          </h1>
          <p className="text-on-surface-variant">
            Sign in to your Refine account
          </p>
        </div>

        <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 space-y-6">
          {/*
            LoginForm reads `?redirect=…` via useSearchParams(). With
            cacheComponents enabled (next.config.ts), any client component
            that touches search params MUST be wrapped in <Suspense> or it
            opts the entire route out of static prerendering.
          */}
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-sm text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-primary font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
