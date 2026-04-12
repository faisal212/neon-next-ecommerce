import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2,
  Smartphone,
  Camera,
  Truck,
  ArrowRight,
  ShoppingBag,
  Copy,
} from 'lucide-react';
import { CopyButton } from './_components/copy-button';
import { WhatsAppButton } from './_components/whatsapp-button';

export const metadata: Metadata = {
  title: 'Order Confirmed',
};

const EASYPAY_NUMBER = '03154267454';
const EASYPAY_DISPLAY = '0315 4267454';
const EASYPAY_NAME = 'Ahmed Bilal';
const WHATSAPP_LINK = `https://wa.me/923154267454`;

interface ConfirmationPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrderConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const sp = await searchParams;
  const orderNumber = typeof sp.order === 'string' ? sp.order : 'N/A';
  const shippingFee = typeof sp.shipping === 'string' ? parseFloat(sp.shipping) : 0;
  const hasShippingFee = shippingFee > 0;

  const whatsappMessage = encodeURIComponent(
    `Hi, I've sent Rs. ${shippingFee} shipping fee for order #${orderNumber} via EasyPaisa. Here's the screenshot:`
  );

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      {/* Animated checkmark */}
      <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full bg-green-500/10"
          style={{ animation: 'confirmation-pulse 2s ease-in-out infinite' }}
        />
        <CheckCircle2 size={56} className="relative text-green-500" />
      </div>

      {/* Headline */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-3">
          Thank You!
        </h1>
        <p className="text-on-surface-variant text-lg">
          Your order has been placed successfully
        </p>
      </div>

      {/* Order number */}
      <div className="mx-auto mb-10 max-w-sm rounded-lg bg-surface-container p-6 text-center">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Order Number
        </span>
        <span className="block text-2xl font-black text-primary tracking-tight">
          {orderNumber}
        </span>
      </div>

      {/* ── EasyPaisa Payment Steps ──────────────────────── */}
      {hasShippingFee && (
        <div className="mb-10 rounded-xl border border-primary/20 bg-surface-container p-6 sm:p-8">
          <h2 className="text-lg font-black mb-1">Complete Your Order</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Send the shipping fee to confirm your order
          </p>

          <div className="space-y-5">
            {/* Step 1 — Done */}
            <StepCard
              number={1}
              done
              title="Order placed"
              description={`Order #${orderNumber} has been received`}
            />

            {/* Step 2 — Send EasyPaisa */}
            <StepCard
              number={2}
              icon={<Smartphone size={18} />}
              title={`Send Rs. ${shippingFee.toLocaleString()} via EasyPaisa`}
              description={
                <span>
                  Send to <strong className="text-on-surface">{EASYPAY_DISPLAY}</strong>
                  <br />
                  Account name: <strong className="text-on-surface">{EASYPAY_NAME}</strong>
                </span>
              }
              action={<CopyButton text={EASYPAY_NUMBER} label="Copy number" />}
            />

            {/* Step 3 — Send screenshot */}
            <StepCard
              number={3}
              icon={<Camera size={18} />}
              title="Send screenshot on WhatsApp"
              description={`Share your EasyPaisa payment screenshot to ${EASYPAY_DISPLAY}`}
            />

            {/* Step 4 — We ship */}
            <StepCard
              number={4}
              icon={<Truck size={18} />}
              title="We ship within 24 hours"
              description="Your order ships after payment verification"
            />
          </div>

          {/* WhatsApp CTA */}
          <WhatsAppButton
            href={`${WHATSAPP_LINK}?text=${whatsappMessage}`}
            orderNumber={orderNumber}
          />
        </div>
      )}

      {/* Fallback info for free shipping */}
      {!hasShippingFee && (
        <div className="space-y-3 mb-10">
          <InfoCard
            icon={<CheckCircle2 size={18} />}
            text="Your order qualifies for free shipping!"
            variant="success"
          />
          <InfoCard
            icon={<Truck size={18} />}
            text="Your order will arrive in 2-3 business days"
          />
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/account/orders"
          className="gradient-button inline-flex w-full items-center justify-center gap-2 rounded-lg px-8 py-4 text-sm font-bold uppercase tracking-wider text-on-primary-fixed transition-all sm:w-auto"
        >
          Track Your Order
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container px-8 py-4 text-sm font-bold uppercase tracking-wider text-on-surface transition-all hover:bg-surface-container-high sm:w-auto"
        >
          <ShoppingBag size={16} />
          Continue Shopping
        </Link>
      </div>

      <style>{`
        @keyframes confirmation-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.25); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function StepCard({
  number,
  title,
  description,
  icon,
  done,
  action,
}: {
  number: number;
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
  done?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          done
            ? 'bg-green-500/20 text-green-500'
            : 'bg-primary/10 text-primary'
        }`}
      >
        {done ? <CheckCircle2 size={16} /> : number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <h3 className="text-sm font-bold">{title}</h3>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  text,
  variant = 'default',
}: {
  icon: React.ReactNode;
  text: string;
  variant?: 'default' | 'success';
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg p-4 text-left text-sm ${
        variant === 'success'
          ? 'border border-green-500/20 bg-green-500/5 text-green-400'
          : 'bg-surface-container text-on-surface-variant'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
