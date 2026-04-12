"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth/client";

export function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    // Neon Auth's signUp.email() SDK only accepts a single `name` field
    // (we can't change that), so we concatenate for the auth identity.
    // The `users` row stores firstName / lastName separately.
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const name = `${trimmedFirst} ${trimmedLast}`.trim();

    try {
      // 1. Create the auth identity via Neon Auth (sets the session cookie).
      const { error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
      });
      if (authError) {
        setError(authError.message ?? "Sign up failed");
        return;
      }

      // 2. Create the matching `users` row. The /api/v1/auth/register
      // route reads the Neon Auth session cookie directly via
      // auth.getSession() — no header needed on our side.
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: trimmedFirst,
          lastName: trimmedLast,
          email,
        }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        setError(json?.error?.message ?? "Account profile creation failed");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="input-indicator">
          <label
            htmlFor="register-first-name"
            className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2"
          >
            First Name
          </label>
          <input
            id="register-first-name"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Muhammad"
            className="w-full bg-surface-container-highest border-none text-on-surface px-4 py-3 text-sm rounded-sm focus:ring-0 focus:outline-none"
          />
        </div>
        <div className="input-indicator">
          <label
            htmlFor="register-last-name"
            className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2"
          >
            Last Name
          </label>
          <input
            id="register-last-name"
            type="text"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Ali"
            className="w-full bg-surface-container-highest border-none text-on-surface px-4 py-3 text-sm rounded-sm focus:ring-0 focus:outline-none"
          />
        </div>
      </div>

      <div className="input-indicator">
        <label
          htmlFor="register-email"
          className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2"
        >
          Email
        </label>
        <input
          id="register-email"
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
          htmlFor="register-password"
          className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2"
        >
          Password
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
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
        {submitting ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
