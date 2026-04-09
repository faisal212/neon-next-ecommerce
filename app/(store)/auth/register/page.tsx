import Link from "next/link";
import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-surface-container-highest rounded-xl flex items-center justify-center mx-auto mb-6">
            <UserPlus size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2">
            Create Account
          </h1>
          <p className="text-on-surface-variant">
            Join Cover for the best tech experience in Pakistan
          </p>
        </div>

        <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 space-y-6">
          <div className="input-indicator">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              className="w-full bg-surface-container-highest border-none text-on-surface px-4 py-3 text-sm rounded-sm focus:ring-0 focus:outline-none"
            />
          </div>

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
              Email (Optional)
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full bg-surface-container-highest border-none text-on-surface px-4 py-3 text-sm rounded-sm focus:ring-0 focus:outline-none"
            />
          </div>

          <button className="gradient-button w-full py-4 text-on-primary-fixed font-black uppercase tracking-[0.15em] text-sm rounded-lg">
            Create Account
          </button>

          <p className="text-center text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
