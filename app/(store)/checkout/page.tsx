'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Package,
  ShieldCheck,
  Truck,
  Clock,
  X,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { useCart } from '@/lib/store/cart-context';
import { storeFetch } from '@/lib/store/api';
import { formatPKR } from '@/lib/store/format';
import { GradientButton } from '@/components/store/gradient-button';
import type { CartItemData } from '@/lib/store/types';

/* ── Types ────────────────────────────────────────────────── */

interface DeliveryZone {
  id: string;
  city: string;
  province: string;
  shippingChargePkr: string;
  estimatedDays: number;
  isCodAvailable: boolean;
}

interface CouponResult {
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

/* ── Constants ────────────────────────────────────────────── */

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Kashmir',
  'Gilgit-Baltistan',
] as const;


const STEPS = [
  { number: '01', label: 'SHIPPING' },
  { number: '02', label: 'PAYMENT' },
  { number: '03', label: 'REVIEW' },
] as const;

/* ── Helpers ──────────────────────────────────────────────── */

function getItemPrice(item: CartItemData): number {
  const unitPrice = parseFloat(item.unitPricePkr || '0');
  return unitPrice * item.quantity;
}

function getVariantLabel(item: CartItemData): string | null {
  const parts = [item.color, item.size].filter(Boolean);
  return parts.length > 0 ? parts.join(' / ') : null;
}

/* ── Component ────────────────────────────────────────────── */

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, itemCount } = useCart();

  /* Step management */
  const [step, setStep] = useState(0);

  /* Shipping form */
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  /* Delivery zones from API */
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  /* Payment */
  const [paymentMethod] = useState<'cod'>('cod');

  /* Coupon */
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<
    (CouponResult & { code: string }) | null
  >(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  /* Order submission */
  const [orderError, setOrderError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  /* Shipping form validation errors */
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>(
    {}
  );

  /* ── Fetch delivery zones ────────────────────────────── */

  useEffect(() => {
    storeFetch<{ data: { zones: DeliveryZone[] } }>('/checkout/delivery-zones')
      .then((res) => {
        setDeliveryZones(res.data?.zones ?? []);
      })
      .catch(() => {
        setDeliveryZones([]);
      });
  }, []);

  // Auto-select zone: city match first, then province fallback
  useEffect(() => {
    if (!province) { setSelectedZoneId(null); return; }

    const provincesZones = deliveryZones.filter(
      (z) => z.province.toLowerCase() === province.toLowerCase()
    );

    // Try city-specific match first
    const cityMatch = city
      ? provincesZones.find((z) => z.city && z.city.toLowerCase() === city.toLowerCase())
      : null;

    // Fall back to province-level zone (city is null/empty)
    const provinceMatch = provincesZones.find((z) => !z.city || z.city === '');

    const match = cityMatch ?? provinceMatch;
    setSelectedZoneId(match?.id ?? null);
  }, [city, province, deliveryZones]);

  /* ── Derived values ──────────────────────────────────── */

  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const shippingCost = selectedZone ? parseFloat(selectedZone.shippingChargePkr) : 0;
  const isCodAvailable = selectedZone ? selectedZone.isCodAvailable : true;
  const estimatedDays = selectedZone?.estimatedDays ?? 3;
  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = subtotal + shippingCost - discount;

  /* ── Shipping validation ─────────────────────────────── */

  const validateShipping = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^03\d{2}-?\d{7}$/.test(phone.replace(/\s/g, '')))
      errors.phone = 'Format: 03XX-XXXXXXX';
    if (!streetAddress.trim()) errors.streetAddress = 'Street address is required';
    if (!city.trim()) errors.city = 'City is required';
    if (!province) errors.province = 'Province is required';
    if (!postalCode.trim()) errors.postalCode = 'Postal code is required';

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  }, [firstName, lastName, phone, streetAddress, city, province, postalCode]);

  /* ── Coupon ──────────────────────────────────────────── */

  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const res = await storeFetch<{ data: CouponResult }>(
        '/coupons/validate',
        {
          method: 'POST',
          body: { code: couponCode.trim(), cartTotal: subtotal.toFixed(2) },
        }
      );
      setAppliedCoupon({ ...res.data, code: couponCode.trim().toUpperCase() });
      setCouponCode('');
    } catch (err) {
      setCouponError(
        err instanceof Error ? err.message : 'Invalid coupon code'
      );
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, subtotal]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError('');
  }, []);

  /* ── Place order ─────────────────────────────────────── */

  const placeOrder = useCallback(async () => {
    setOrderError('');
    setOrderLoading(true);
    try {
      const res = await storeFetch<{ data: { orderNumber: string } }>(
        '/orders',
        {
          method: 'POST',
          body: {
            shippingAddress: {
              firstName,
              lastName,
              phone,
              streetAddress,
              city,
              province,
              postalCode,
            },
            deliveryZoneId: selectedZoneId,
            paymentMethod,
            couponCode: appliedCoupon?.code ?? undefined,
          },
        }
      );
      router.push(
        `/checkout/confirmation?order=${encodeURIComponent(res.data.orderNumber)}`
      );
    } catch (err) {
      setOrderError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setOrderLoading(false);
    }
  }, [
    firstName,
    lastName,
    phone,
    streetAddress,
    city,
    province,
    postalCode,
    selectedZoneId,
    paymentMethod,
    appliedCoupon,
    router,
  ]);

  /* ── Empty cart guard ────────────────────────────────── */

  if (itemCount === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-32 text-center">
        <Package size={48} className="mx-auto mb-6 text-on-surface-variant/40" />
        <h1 className="text-3xl font-black tracking-tighter mb-4">
          YOUR CART IS EMPTY
        </h1>
        <p className="text-on-surface-variant mb-8">
          Add some items to your cart before checking out.
        </p>
        <GradientButton href="/">Continue Shopping</GradientButton>
      </section>
    );
  }

  /* ── Render ──────────────────────────────────────────── */

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-20">
      {/* ── Header + Step Indicator ─────────────────────── */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">
          SECURE CHECKOUT
        </h1>

        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.number} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (i < step) setStep(i);
                }}
                disabled={i > step}
                className="flex items-center gap-2 disabled:cursor-default"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                    i === step
                      ? 'bg-primary text-on-primary-fixed'
                      : i < step
                        ? 'bg-primary/20 text-primary'
                        : 'bg-surface-container-highest opacity-40'
                  }`}
                >
                  {s.number}
                </span>
                <span
                  className={`hidden text-[10px] font-bold uppercase tracking-widest sm:block ${
                    i === step
                      ? 'text-on-surface'
                      : i < step
                        ? 'text-primary'
                        : 'text-on-surface-variant opacity-40'
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="h-[1px] w-12 bg-outline-variant/30" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Grid Layout ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left - Form */}
        <div className="lg:col-span-7">
          {/* ── Step 1: Shipping ──────────────────────── */}
          {step === 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-primary pulse-glow" />
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Shipping Destination
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputField
                  label="First Name"
                  value={firstName}
                  onChange={setFirstName}
                  error={shippingErrors.firstName}
                  placeholder="Muhammad"
                />
                <InputField
                  label="Last Name"
                  value={lastName}
                  onChange={setLastName}
                  error={shippingErrors.lastName}
                  placeholder="Ali"
                />
                <InputField
                  label="Phone Number"
                  value={phone}
                  onChange={setPhone}
                  error={shippingErrors.phone}
                  placeholder="03XX-XXXXXXX"
                  type="tel"
                  colSpan="full"
                />
                <InputField
                  label="Street Address"
                  value={streetAddress}
                  onChange={setStreetAddress}
                  error={shippingErrors.streetAddress}
                  placeholder="House #, Street, Area"
                  colSpan="full"
                />
                <InputField
                  label="City"
                  value={city}
                  onChange={setCity}
                  error={shippingErrors.city}
                  placeholder="Lahore"
                />
                <SelectField
                  label="Province"
                  value={province}
                  onChange={setProvince}
                  error={shippingErrors.province}
                  options={PROVINCES.map((p) => ({ value: p, label: p }))}
                  placeholder="Select province"
                />
                <InputField
                  label="Postal Code"
                  value={postalCode}
                  onChange={setPostalCode}
                  error={shippingErrors.postalCode}
                  placeholder="54000"
                />
              </div>

              {/* Delivery info (based on city) */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Shipping Info
                </h3>
                {selectedZone ? (
                  <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold">
                          Delivery to {selectedZone.city || province}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-on-surface-variant uppercase tracking-widest">
                          <Truck size={12} />
                          Estimated {selectedZone.estimatedDays} day{selectedZone.estimatedDays !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {parseFloat(selectedZone.shippingChargePkr) === 0
                          ? 'Free'
                          : formatPKR(selectedZone.shippingChargePkr)}
                      </span>
                    </div>
                    {!selectedZone.isCodAvailable && (
                      <p className="mt-2 text-[10px] text-tertiary font-bold uppercase tracking-widest">
                        COD not available for this area
                      </p>
                    )}
                  </div>
                ) : province ? (
                  <div className="rounded-lg border border-outline-variant/10 bg-surface-container p-4">
                    <p className="text-sm text-on-surface-variant">
                      No shipping rate configured for this area yet. Please contact support.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-outline-variant/10 bg-surface-container p-4">
                    <p className="text-sm text-on-surface-variant">
                      Select your province to see shipping rates.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <Link
                  href="/products"
                  className="flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  <ChevronLeft size={16} />
                  Return to Cart
                </Link>
                <GradientButton
                  onClick={() => {
                    if (validateShipping()) setStep(1);
                  }}
                >
                  Continue to Payment
                </GradientButton>
              </div>
            </div>
          )}

          {/* ── Step 2: Payment ───────────────────────── */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-primary pulse-glow" />
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* COD Option */}
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-primary/40 bg-primary/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-bold">Cash on Delivery</span>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                        Pay when your order arrives
                      </p>
                    </div>
                  </div>
                  <span className="rounded bg-surface-container-highest px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Pay on Delivery
                  </span>
                </label>

                {/* Online payment placeholder */}
                <div className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container p-5 opacity-40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-outline-variant">
                    </div>
                    <div>
                      <span className="text-sm font-bold">Online Payment</span>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                        Coming Soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  <ChevronLeft size={16} />
                  Back to Shipping
                </button>
                <GradientButton onClick={() => setStep(2)}>
                  Continue to Review
                </GradientButton>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ────────────────────────── */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-primary pulse-glow" />
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Review Your Order
                </h2>
              </div>

              {/* Item list */}
              <div className="space-y-4">
                {items.map((item) => (
                  <ReviewItem key={item.id} item={item} />
                ))}
              </div>

              {/* Promo code */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Promo Code
                </h3>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                    <div>
                      <span className="text-sm font-bold text-green-400">
                        {appliedCoupon.code}
                      </span>
                      <span className="ml-2 text-sm text-green-400/80">
                        -{formatPKR(appliedCoupon.discountAmount)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-on-surface-variant transition-colors hover:text-destructive"
                      aria-label="Remove coupon"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="input-indicator relative flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        placeholder="Enter code"
                        className="w-full bg-surface-container-highest border-none text-on-surface px-4 py-3 text-sm rounded-sm placeholder:text-on-surface-variant/40 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="rounded-sm bg-surface-container-highest px-6 py-3 text-sm font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-bright disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle size={12} />
                    {couponError}
                  </p>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 border-t border-outline-variant/10 pt-6">
                <PriceLine label="Subtotal" value={formatPKR(subtotal)} />
                <PriceLine
                  label="Shipping"
                  value={
                    shippingCost === 0 ? 'Free' : formatPKR(shippingCost)
                  }
                  highlight={shippingCost === 0}
                />
                {discount > 0 && (
                  <PriceLine
                    label="Discount"
                    value={`-${formatPKR(discount)}`}
                    highlight
                  />
                )}
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3">
                  <span className="text-lg font-black uppercase tracking-tighter">
                    Total
                  </span>
                  <span className="text-xl font-black">{formatPKR(total)}</span>
                </div>
              </div>

              {/* Order error */}
              {orderError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  <AlertCircle size={16} />
                  {orderError}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  <ChevronLeft size={16} />
                  Back to Payment
                </button>
                <GradientButton
                  onClick={placeOrder}
                  disabled={orderLoading}
                  className={orderLoading ? 'opacity-70 pointer-events-none' : ''}
                >
                  {orderLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Placing Order...
                    </span>
                  ) : (
                    'Place Order'
                  )}
                </GradientButton>
              </div>
            </div>
          )}
        </div>

        {/* Right - Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-xl bg-surface-container-low p-8">
            <h3 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Order Summary
            </h3>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <SidebarItem key={item.id} item={item} />
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-outline-variant/10 pt-4 space-y-3">
              <PriceLine label="Subtotal" value={formatPKR(subtotal)} />
              <PriceLine
                label="Shipping"
                value={
                  step >= 0
                    ? shippingCost === 0
                      ? 'Free'
                      : formatPKR(shippingCost)
                    : '--'
                }
                highlight={shippingCost === 0}
              />
              {discount > 0 && (
                <PriceLine
                  label="Discount"
                  value={`-${formatPKR(discount)}`}
                  highlight
                />
              )}
              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3">
                <span className="text-sm font-black uppercase tracking-tighter">
                  Total
                </span>
                <span className="text-lg font-black">{formatPKR(total)}</span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <TrustCard icon={<Lock size={14} />} label="Secure SSL" />
              <TrustCard icon={<Package size={14} />} label="Tracked" />
              <TrustCard icon={<ShieldCheck size={14} />} label="Warranty" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function InputField({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
  colSpan,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  colSpan?: 'full';
}) {
  return (
    <div className={colSpan === 'full' ? 'md:col-span-2' : ''}>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </label>
      <div className="input-indicator relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-surface-container-highest border-none text-on-surface px-4 py-3 text-sm rounded-sm placeholder:text-on-surface-variant/40 focus:outline-none ${
            error ? 'ring-1 ring-destructive' : ''
          }`}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-[10px] text-destructive">{error}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  error,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </label>
      <div className="input-indicator relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none bg-surface-container-highest border-none text-on-surface px-4 py-3 text-sm rounded-sm focus:outline-none ${
            !value ? 'text-on-surface-variant/40' : ''
          } ${error ? 'ring-1 ring-destructive' : ''}`}
        >
          <option value="" disabled>
            {placeholder ?? 'Select'}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <ChevronLeft size={14} className="-rotate-90 text-on-surface-variant" />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-[10px] text-destructive">{error}</p>
      )}
    </div>
  );
}

function ReviewItem({ item }: { item: CartItemData }) {
  const variantLabel = getVariantLabel(item);
  const lineTotal = getItemPrice(item);
  const displayName = item.productName || item.sku || 'Product';

  return (
    <div className="flex gap-4 rounded-lg bg-surface-container p-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container-highest">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={displayName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant/30 text-[10px] uppercase tracking-widest">
            No img
          </div>
        )}
        {/* Qty badge */}
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-on-primary-fixed">
          {item.quantity}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <span className="truncate text-sm font-bold uppercase tracking-tight">
          {displayName}
        </span>
        {variantLabel && (
          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
            {variantLabel}
          </span>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center">
        <span className="text-sm font-bold">{formatPKR(lineTotal)}</span>
      </div>
    </div>
  );
}

function SidebarItem({ item }: { item: CartItemData }) {
  const variantLabel = getVariantLabel(item);
  const lineTotal = getItemPrice(item);
  const displayName = item.productName || item.sku || 'Product';

  return (
    <div className="flex gap-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container-highest">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={displayName}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant/30 text-[8px] uppercase tracking-widest">
            No img
          </div>
        )}
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-on-primary-fixed">
          {item.quantity}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <span className="truncate text-xs font-bold uppercase tracking-tight">
          {displayName}
        </span>
        {variantLabel && (
          <span className="text-[9px] text-on-surface-variant uppercase tracking-widest">
            {variantLabel}
          </span>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center">
        <span className="text-xs font-bold">{formatPKR(lineTotal)}</span>
      </div>
    </div>
  );
}

function PriceLine({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <span
        className={`text-sm font-bold ${highlight ? 'text-green-400' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

function TrustCard({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg bg-surface-container p-3 text-center">
      <span className="text-on-surface-variant">{icon}</span>
      <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}
