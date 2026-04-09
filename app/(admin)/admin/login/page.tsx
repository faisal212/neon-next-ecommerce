import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <span className="absolute inset-0 rounded-2xl bg-emerald-500/10" />
              <span className="absolute inset-2 rounded-xl bg-emerald-500/10" />
              <span className="pulse-dot relative h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            PK Admin
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Sign in to your admin account
          </p>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
