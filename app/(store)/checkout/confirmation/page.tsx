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
          <a
            href={`${WHATSAPP_LINK}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-[#25D366] px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#1fb855]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Send Screenshot on WhatsApp
          </a>
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
