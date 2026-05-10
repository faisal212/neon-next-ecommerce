'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { storeFetch } from '@/lib/store/api';
import { formatPKR } from '@/lib/store/format';
import { QuantitySelector } from '@/components/store/quantity-selector';
import { GradientButton } from '@/components/store/gradient-button';
import { StockIndicator } from '@/components/store/stock-indicator';
import { cn } from '@/lib/utils';
import { trackAddToCart } from '@/components/store/analytics';

interface VariantData {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  extraPricePkr: string | null;
  isActive: boolean;
}

type StockEntry = { onHand: number; reserved: number; available: number };
type StockMap = Record<string, StockEntry>;

interface AddToCartPanelProps {
  productId: string;
  productSlug: string;
  productName: string;
  basePricePkr: string;
  variants: VariantData[];
  initialVariantId?: string | null;
  // Variant selectors (color / size). Rendered between price and the
  // stock indicator so the live selection is visible inside the same
  // sticky purchase column instead of split across two grid columns.
  children?: React.ReactNode;
}

export function AddToCartPanel({
  productId,
  productSlug,
  productName,
  basePricePkr,
  variants,
  initialVariantId,
  children,
}: AddToCartPanelProps) {
  const { addItem, isPending, items } = useCart();

  const activeVariants = variants.filter((v) => v.isActive);
  const hasOptions = activeVariants.some((v) => v.color || v.size);

  // Auto-select if only one variant; server-provided initialVariantId takes precedence
  const autoSelectedVariantId = activeVariants.length === 1 ? activeVariants[0].id : null;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    initialVariantId ?? autoSelectedVariantId,
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Live stock map, fetched after hydration so the cached page shell never
  // carries volatile inventory numbers. Null = not yet loaded.
  const [stockMap, setStockMap] = useState<StockMap | null>(null);
  const cancelled = useRef(false);

  const selectedVariant = useMemo(
    () => activeVariants.find((v) => v.id === selectedVariantId) ?? null,
    [activeVariants, selectedVariantId],
  );

  // Compute total price
  const totalPrice = useMemo(() => {
    const base = parseFloat(basePricePkr);
    const extra = selectedVariant?.extraPricePkr ? parseFloat(selectedVariant.extraPricePkr) : 0;
    return base + extra;
  }, [basePricePkr, selectedVariant]);

  const stockEntry = selectedVariantId ? stockMap?.[selectedVariantId] ?? null : null;
  const stockLoaded = stockMap !== null;
  // The user's existing quantity for this variant in their cart eats into
  // their addable headroom — server-side cart-add validates the same way
  // (cart.service.addItem: existingItem.quantity + input.quantity > available).
  const cartQtyForVariant = useMemo(
    () =>
      selectedVariantId
        ? items
            .filter((i) => i.variantId === selectedVariantId)
            .reduce((sum, i) => sum + i.quantity, 0)
        : 0,
    [items, selectedVariantId],
  );
  // userAddable = what server-side cart-add would allow (drives the button
  //   gate and the QuantitySelector cap).
  // remainingAfterPick = what would be left if the user committed the current
  //   selector value (drives only the indicator — a live preview).
  // We must not collapse these into one number: when the user picks the max
  //   valid quantity, the indicator should preview "Out of Stock" but the
  //   button must stay enabled so they can actually buy the last units.
  const userAddable = stockEntry
    ? Math.max(0, stockEntry.available - cartQtyForVariant)
    : null;
  const maxStock = userAddable ?? undefined;
  const outOfStock = stockLoaded && stockEntry !== null && userAddable === 0;
  const needsSelection = hasOptions && !selectedVariantId;

  // Clamp the chosen quantity if stock comes in lower than what the user typed.
  useEffect(() => {
    if (typeof maxStock === 'number' && maxStock > 0 && quantity > maxStock) {
      setQuantity(maxStock);
    }
  }, [maxStock, quantity]);

  // Fetch live stock after hydration via requestIdleCallback
  useEffect(() => {
    cancelled.current = false;

    const run = async () => {
      try {
        const res = await storeFetch<{ data: StockMap }>(`/products/${productSlug}/stock`);
        if (!cancelled.current) setStockMap(res.data ?? {});
      } catch {
        if (!cancelled.current) setStockMap({});
      }
    };

    const ric = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof ric.requestIdleCallback === 'function') {
      idleId = ric.requestIdleCallback(run, { timeout: 1500 });
    } else {
      timeoutId = setTimeout(run, 200);
    }

    return () => {
      cancelled.current = true;
      if (idleId !== undefined) ric.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [productSlug]);

  // Listen for configurator variant changes via custom event
  useEffect(() => {
    function handleVariantEvent(e: Event) {
      const detail = (e as CustomEvent<string | null>).detail;
      setSelectedVariantId(detail);
    }

    window.addEventListener('pdp:variant-change', handleVariantEvent);
    return () => window.removeEventListener('pdp:variant-change', handleVariantEvent);
  }, []);

  const handleAddToCart = async () => {
    const variantId = selectedVariantId ?? autoSelectedVariantId;
    if (!variantId) return;

    setIsAdding(true);
    try {
      await addItem(variantId, quantity);
      trackAddToCart({
        id: variantId,
        name: productName,
        price: totalPrice,
        quantity,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      {/* Label */}
      <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant font-medium mb-2">
        Selected Configuration
      </p>

      {/* Product name */}
      <h2 className="text-xl font-bold text-on-surface mb-6">{productName}</h2>

      {/* Price */}
      <div className="mb-8">
        <span className="text-2xl sm:text-3xl font-black text-on-surface">{formatPKR(totalPrice)}</span>
        {selectedVariant?.extraPricePkr && parseFloat(selectedVariant.extraPricePkr) > 0 && (
          <span className="ml-3 text-sm text-on-surface-variant">
            Base {formatPKR(basePricePkr)} + {formatPKR(selectedVariant.extraPricePkr)}
          </span>
        )}
      </div>

      {/* Variant selectors — color swatches, size buttons. Rendered as
          children rather than a fixed slot so the page can decide
          which selectors to show without us hardcoding them here. */}
      {children && <div className="mb-8">{children}</div>}

      {/* Stock indicator. Stock is fetched live above; show a skeleton until
          it lands so the cached page shell never carries inventory numbers. */}
      <div className="mb-6 min-h-[1.25rem]">
        {stockEntry ? (
          <StockIndicator
            quantityOnHand={stockEntry.onHand}
            // Treat the user's cart quantity AND their currently-selected
            // QuantitySelector value as additional reservation so the
            // indicator previews what would remain after they commit this
            // pick. The Add to Cart button is gated separately on userAddable.
            quantityReserved={stockEntry.reserved + cartQtyForVariant + quantity}
            lowStockThreshold={5}
          />
        ) : !stockLoaded ? (
          <span
            aria-hidden
            className="inline-block h-4 w-24 rounded bg-surface-container/60 animate-pulse"
          />
        ) : null}
      </div>

      {/* Quantity */}
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant font-medium mb-3">
          Quantity
        </p>
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={maxStock}
          disabled={outOfStock}
        />
      </div>

      {/* Add to Cart button. Disabled until live stock has loaded so the user
          can never queue a quantity that exceeds available inventory. Server
          validates again in cart.service.addItem as the authoritative gate. */}
      {needsSelection ? (
        <button
          type="button"
          disabled
          className={cn(
            'w-full inline-flex items-center justify-center font-bold rounded-lg text-sm uppercase tracking-wider px-8 py-4',
            'bg-surface-container-highest text-on-surface-variant cursor-not-allowed',
          )}
        >
          Select options above
        </button>
      ) : outOfStock ? (
        <button
          type="button"
          disabled
          className={cn(
            'w-full inline-flex items-center justify-center font-bold rounded-lg text-sm uppercase tracking-wider px-8 py-4',
            'bg-surface-container-highest text-on-surface-variant cursor-not-allowed',
          )}
        >
          Out of Stock
        </button>
      ) : (
        <GradientButton
          onClick={handleAddToCart}
          disabled={isPending || isAdding || !stockLoaded}
          className="w-full"
        >
          {!stockLoaded ? 'Checking stock…' : isAdding || isPending ? 'Adding...' : 'Add to Cart'}
        </GradientButton>
      )}

      {/* Trust badges */}
      <div className="flex items-center gap-4 sm:gap-8 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-outline-variant/10">
        <div className="flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-primary" />
          <span className="text-xs text-on-surface-variant">Free Express</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-xs text-on-surface-variant">2-Year Warranty</span>
        </div>
      </div>
    </>
  );
}
