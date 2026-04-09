"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-[12px] font-medium text-zinc-400"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
          autoFocus
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-[14px] text-foreground outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-[12px] font-medium text-zinc-400"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 pr-10 text-[14px] text-foreground outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-zinc-400"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-[14px] font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
