"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
      });
      if (authError) {
        setError(authError.message ?? "Invalid email or password");
        return;
      }
      // Honour ?redirect=… if the user landed here from a protected page.
      const redirectTo = searchParams.get("redirect") || "/account";
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="input-indicator">
        <label
          htmlFor="login-email"
          className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2"
        >
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-surface-container-highest border-none text-on-surface px-4 py-3 text-sm rounded-sm focus:ring-0 focus:outline-none"
        />
      </div>

      <div className="input-indicator">
        <label
          htmlFor="login-password"
          className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full bg-surface-container-highest border-none text-on-surface px-4 py-3 text-sm rounded-sm focus:ring-0 focus:outline-none"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-sm border border-error/30 bg-error/10 px-4 py-3 text-[12px] font-medium text-error"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="gradient-button w-full py-4 text-on-primary-fixed font-black uppercase tracking-[0.15em] text-sm rounded-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
