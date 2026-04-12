'use client';

import { useState, useMemo, useEffect } from 'react';
import { Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { formatPKR } from '@/lib/store/format';
import { QuantitySelector } from '@/components/store/quantity-selector';
import { GradientButton } from '@/components/store/gradient-button';
import { StockIndicator } from '@/components/store/stock-indicator';
import { cn } from '@/lib/utils';

interface VariantData {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  extraPricePkr: string | null;
  isActive: boolean;
  stock: { onHand: number; reserved: number; available: number } | null;
}

interface AddToCartPanelProps {
  productId: string;
  productName: string;
  basePricePkr: string;
  variants: VariantData[];
}

export function AddToCartPanel({
  productId,
  productName,
  basePricePkr,
  variants,
}: AddToCartPanelProps) {
  const { addItem, isPending } = useCart();

  const activeVariants = variants.filter((v) => v.isActive);
  const hasOptions = activeVariants.some((v) => v.color || v.size);

  // Auto-select if only one variant
  const autoSelectedVariantId = activeVariants.length === 1 ? activeVariants[0].id : null;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(autoSelectedVariantId);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

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

  // Max stock for selected variant
  const maxStock = selectedVariant?.stock?.available ?? undefined;

  const needsSelection = hasOptions && !selectedVariantId;

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
    } finally {
      setIsAdding(false);
    }
  };

  const outOfStock = selectedVariant?.stock?.available === 0;

  return (
    <div className="sticky top-32 glass-panel p-5 sm:p-8 lg:p-10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-outline-variant/10">
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

      {/* Variant info */}
      {selectedVariant && (
        <div className="flex flex-wrap gap-3 mb-6 text-sm text-on-surface-variant">
          {selectedVariant.color && (
            <span className="px-3 py-1 rounded bg-surface-container-highest text-on-surface">
              {selectedVariant.color}
            </span>
          )}
          {selectedVariant.size && (
            <span className="px-3 py-1 rounded bg-surface-container-highest text-on-surface">
              {selectedVariant.size}
            </span>
          )}
        </div>
      )}

      {/* Stock indicator */}
      {selectedVariant?.stock && (
        <div className="mb-6">
          <StockIndicator
            quantityOnHand={selectedVariant.stock.onHand}
            quantityReserved={selectedVariant.stock.reserved}
            lowStockThreshold={5}
          />
        </div>
      )}

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

      {/* Add to Cart button */}
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
          disabled={isPending || isAdding}
          className="w-full"
        >
          {isAdding || isPending ? 'Adding...' : 'Add to Cart'}
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
    </div>
  );
}
