import Link from "next/link";
import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

import { RegisterForm } from "./_components/register-form";

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
            Join Refine for the best tech experience in Pakistan
          </p>
        </div>

        <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 space-y-6">
          <RegisterForm />

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
