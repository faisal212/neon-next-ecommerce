import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2,
  Smartphone,
  Building2,
  Camera,
  Truck,
  ArrowRight,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';
import { CopyButton } from './_components/copy-button';
import { WhatsAppButton } from './_components/whatsapp-button';

export const metadata: Metadata = {
  title: 'Order Confirmed',
};

const ADVANCE_AMOUNT = 250;
const ACCOUNT_TITLE = 'Ahmed Bilal';
const EASYPAISA_NUMBER = '03154267454';
const BANK_NAME = 'Meezan Bank';
const BANK_ACCOUNT = '51680020152431280016';
const BANK_IBAN = 'PK42ABPA0020152431280016';
const WHATSAPP_DISPLAY = '03154267454';
const WHATSAPP_LINK = 'https://wa.me/923154267454';

interface ConfirmationPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrderConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const sp = await searchParams;
  const orderNumber = typeof sp.order === 'string' ? sp.order : 'N/A';
  const orderTotal = typeof sp.total === 'string' ? parseFloat(sp.total) : 0;
  const codRemaining = Math.max(0, orderTotal - ADVANCE_AMOUNT);

  const whatsappMessage = encodeURIComponent(
    `Salam, order #${orderNumber} ke liye Rs. ${ADVANCE_AMOUNT} advance bhej diya hai. Screenshot attached.`,
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
          Shukriya!
        </h1>
        <p className="text-on-surface-variant text-lg">
          Aap ka order place ho gaya hai
        </p>
      </div>

      {/* Order number */}
      <div className="mx-auto mb-8 max-w-sm rounded-lg bg-surface-container p-6 text-center">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Order Number
        </span>
        <span className="block text-2xl font-black text-primary tracking-tight">
          {orderNumber}
        </span>
      </div>

      {/* ── Roman Urdu Advance Payment Block ─────────────── */}
      <div className="mb-10 space-y-5 rounded-xl border border-primary/30 bg-surface-container p-5 sm:p-6">
        {/* Warning band */}
        <div className="flex items-start gap-3 rounded-lg border-l-4 border-primary bg-surface-container-highest p-4">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-primary" />
          <p className="text-sm font-semibold text-on-surface leading-snug">
            Rs. {ADVANCE_AMOUNT} advance bhejne tak order ship nahi hoga
          </p>
        </div>

        {/* Big amount card */}
        <div className="rounded-lg bg-surface-container-low p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Advance Payment Required
          </p>
          <p className="text-4xl font-black tracking-tighter text-primary">
            RS {ADVANCE_AMOUNT}
          </p>
          <p className="mt-3 text-base text-on-surface/90 leading-relaxed">
            Yeh amount total bill se minus kar di jayegi <span aria-hidden>✅</span>
            {orderTotal > 0 && (
              <>
                <br />
                Baaki <strong className="text-on-surface">Rs. {codRemaining.toLocaleString('en-PK')}</strong>{' '}
                delivery ke time (COD) pay karna hoga
              </>
            )}
          </p>
        </div>

        {/* Steps overview */}
        <div className="space-y-4">
          <StepCard
            number={1}
            done
            title="Order place ho gaya"
            description={`Order #${orderNumber} confirmed`}
          />
          <StepCard
            number={2}
            icon={<Smartphone size={18} />}
            title={`Rs. ${ADVANCE_AMOUNT} advance bhejein`}
            description="Niche di gayi details par payment send karein"
          />
          <StepCard
            number={3}
            icon={<Camera size={18} />}
            title="Screenshot WhatsApp par bhejein"
            description={`Payment ke baad screenshot ${WHATSAPP_DISPLAY} par bhej dein`}
          />
          <StepCard
            number={4}
            icon={<Truck size={18} />}
            title="24 ghante mein ship ho jayega"
            description="Payment verify hone ke baad order dispatch hoga"
          />
        </div>

        {/* Two payment channels */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Easypaisa / NayaPay */}
          <div className="space-y-3 rounded-lg border border-outline-variant/15 bg-surface-container-low p-4">
            <div className="flex items-center gap-2">
              <Smartphone size={14} className="text-primary" />
              <h4 className="text-sm font-bold">Easypaisa / NayaPay</h4>
            </div>
            <PaymentRow label="Account Title" value={ACCOUNT_TITLE} />
            <PaymentRow label="Number" value={EASYPAISA_NUMBER} copyable />
          </div>

          {/* Meezan Bank */}
          <div className="space-y-3 rounded-lg border border-outline-variant/15 bg-surface-container-low p-4">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-primary" />
              <h4 className="text-sm font-bold">{BANK_NAME}</h4>
            </div>
            <PaymentRow label="Account Title" value={ACCOUNT_TITLE} />
            <PaymentRow label="Account No" value={BANK_ACCOUNT} copyable />
            <PaymentRow label="IBAN" value={BANK_IBAN} copyable />
          </div>
        </div>

        {/* Screenshot directive */}
        <div className="flex items-start gap-3 rounded-lg border-l-4 border-[#25D366] bg-surface-container-highest p-4">
          <Camera size={20} className="mt-0.5 flex-shrink-0 text-[#25D366]" />
          <p className="text-base text-on-surface/90 leading-relaxed">
            Payment ke baad screenshot WhatsApp par send kar dein:{' '}
            <strong className="font-mono text-on-surface">{WHATSAPP_DISPLAY}</strong>
          </p>
        </div>

        {/* WhatsApp CTA */}
        <WhatsAppButton
          href={`${WHATSAPP_LINK}?text=${whatsappMessage}`}
          orderNumber={orderNumber}
          label="WhatsApp Par Screenshot Bhejein"
        />
      </div>

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
}: {
  number: number;
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
  done?: boolean;
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
        <p className="mt-1 text-sm text-on-surface/85">{description}</p>
      </div>
    </div>
  );
}

function PaymentRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
          {label}
        </p>
        <p className="mt-0.5 break-all font-mono text-base font-bold tracking-tight text-on-surface">
          {value}
        </p>
      </div>
      {copyable && (
        <div className="flex-shrink-0">
          <CopyButton text={value} label="Copy" />
        </div>
      )}
    </div>
  );
}
