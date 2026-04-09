import Link from "next/link";
import type { Metadata } from "next";
import { LogIn } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In",
};

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
            Sign in to your Cover account
          </p>
        </div>

        <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 space-y-6">
          <div className="input-indicator">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="03XX-XXXXXXX"
              className="w-full bg-surface-container-highest border-none text-on-surface px-4 py-3 text-sm rounded-sm focus:ring-0 focus:outline-none"
            />
          </div>

          <div className="input-indicator">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full bg-surface-container-highest border-none text-on-surface px-4 py-3 text-sm rounded-sm focus:ring-0 focus:outline-none"
            />
          </div>

          <button className="gradient-button w-full py-4 text-on-primary-fixed font-black uppercase tracking-[0.15em] text-sm rounded-lg">
            Sign In
          </button>

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
