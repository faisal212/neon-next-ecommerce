import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2,
  MessageSquare,
  Banknote,
  Truck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Order Confirmed',
};

interface ConfirmationPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrderConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const sp = await searchParams;
  const orderNumber =
    typeof sp.order === 'string' ? sp.order : 'N/A';

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 md:py-32 text-center">
      {/* Animated checkmark */}
      <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full bg-green-500/10"
          style={{
            animation: 'confirmation-pulse 2s ease-in-out infinite',
          }}
        />
        <CheckCircle2 size={64} className="relative text-green-500" />
      </div>

      {/* Headline */}
      <h1 className="text-5xl font-black tracking-tighter mb-3">
        Thank You!
      </h1>
      <p className="text-on-surface-variant text-lg mb-10">
        Your order has been placed successfully
      </p>

      {/* Order number box */}
      <div className="mx-auto mb-10 max-w-sm rounded-lg bg-surface-container p-6 text-center">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Order Number
        </span>
        <span className="block text-2xl font-black text-primary tracking-tight">
          {orderNumber}
        </span>
      </div>

      {/* Info cards */}
      <div className="space-y-3 mb-12">
        <InfoCard
          icon={<MessageSquare size={18} />}
          text="You'll receive an SMS confirmation shortly"
        />
        <InfoCard
          icon={<Banknote size={18} />}
          text="Please keep the exact amount ready for the delivery rider"
          variant="warning"
        />
        <InfoCard
          icon={<Truck size={18} />}
          text="Your order will arrive in 2-3 business days"
        />
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/account/orders"
          className="gradient-button inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-sm font-bold uppercase tracking-wider text-on-primary-fixed transition-all"
        >
          Track Your Order
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container px-8 py-4 text-sm font-bold uppercase tracking-wider text-on-surface transition-all hover:bg-surface-container-high"
        >
          <ShoppingBag size={16} />
          Continue Shopping
        </Link>
      </div>

      {/* CSS animation for the pulse ring */}
      <style>{`
        @keyframes confirmation-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.25); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

/* ── Sub-component ────────────────────────────────────────── */

function InfoCard({
  icon,
  text,
  variant = 'default',
}: {
  icon: React.ReactNode;
  text: string;
  variant?: 'default' | 'warning';
}) {
  const isWarning = variant === 'warning';

  return (
    <div
      className={`flex items-center gap-4 rounded-lg p-4 text-left text-sm ${
        isWarning
          ? 'border border-tertiary/20 bg-tertiary/5 text-tertiary'
          : 'bg-surface-container text-on-surface-variant'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
