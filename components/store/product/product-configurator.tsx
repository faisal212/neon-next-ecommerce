'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatPKR } from '@/lib/store/format';

interface VariantData {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  extraPricePkr: string | null;
  isActive: boolean;
  stock: { onHand: number; reserved: number; available: number } | null;
}

interface ProductConfiguratorProps {
  variants: VariantData[];
}

const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#22C55E',
  gold: '#EAB308',
  silver: '#C0C0C0',
  pink: '#EC4899',
  purple: '#A855F7',
  orange: '#FF915C',
  navy: '#1E3A5F',
  grey: '#6B7280',
  gray: '#6B7280',
  midnight: '#191970',
  graphite: '#383838',
  'space gray': '#4A4A4A',
  titanium: '#878681',
  'rose gold': '#B76E79',
  'silver-white': '#C0C0C0',
  'black-white': '#1A1A1A',
  'gold-black': '#C8A95C',
  'blue-black': '#1E3A5F',
};

function getColorHex(colorName: string): string | null {
  return COLOR_MAP[colorName.toLowerCase()] ?? null;
}

export function ProductConfigurator({ variants }: ProductConfiguratorProps) {
  const activeVariants = useMemo(() => variants.filter((v) => v.isActive), [variants]);

  const uniqueColors = useMemo(() => {
    const colors = new Set<string>();
    activeVariants.forEach((v) => {
      if (v.color) colors.add(v.color);
    });
    return Array.from(colors);
  }, [activeVariants]);

  const uniqueSizes = useMemo(() => {
    const sizes = new Set<string>();
    activeVariants.forEach((v) => {
      if (v.size) sizes.add(v.size);
    });
    return Array.from(sizes);
  }, [activeVariants]);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    uniqueColors.length === 1 ? uniqueColors[0] : null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    uniqueSizes.length === 1 ? uniqueSizes[0] : null,
  );

  // Pre-select variant from URL #variant= hash after hydration (mount only)
  const variantsRef = useRef(activeVariants);
  variantsRef.current = activeVariants;
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const variantId = params.get('variant');
    if (!variantId) return;
    const match = variantsRef.current.find((v) => v.id === variantId);
    if (!match) return;
    if (match.color) setSelectedColor(match.color);
    if (match.size) setSelectedSize(match.size);
  }, []);

  // Find matched variant
  const selectedVariant = useMemo(() => {
    return activeVariants.find((v) => {
      const colorMatch = uniqueColors.length === 0 || v.color === selectedColor;
      const sizeMatch = uniqueSizes.length === 0 || v.size === selectedSize;
      return colorMatch && sizeMatch;
    }) ?? null;
  }, [activeVariants, selectedColor, selectedSize, uniqueColors.length, uniqueSizes.length]);

  // Notify sibling components and update URL hash
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('pdp:variant-change', { detail: selectedVariant?.id ?? null }),
    );
    if (selectedVariant) {
      window.history.replaceState(null, '', `#variant=${selectedVariant.id}`);
    }
  }, [selectedVariant?.id]);

  // Available sizes for selected color
  const availableSizes = useMemo(() => {
    if (!selectedColor) return uniqueSizes;
    return activeVariants
      .filter((v) => v.color === selectedColor && v.size)
      .map((v) => v.size!);
  }, [activeVariants, selectedColor, uniqueSizes]);

  if (activeVariants.length === 0) {
    return null;
  }

  const hasColors = uniqueColors.length > 0;
  const hasSizes = uniqueSizes.length > 0;

  if (!hasColors && !hasSizes) {
    return null;
  }

  return (
    <div className="space-y-6 lg:space-y-10">
      {/* Color swatches */}
      {hasColors && (
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant font-medium mb-4">
            Color{selectedColor ? ` — ${selectedColor}` : ''}
          </h3>
          <div className="flex flex-wrap gap-3">
            {uniqueColors.map((color) => {
              const hex = getColorHex(color);
              const isSelected = selectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-10 h-10 rounded-full transition-all relative',
                    isSelected
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
                      : 'ring-1 ring-outline-variant/30 hover:ring-outline-variant',
                  )}
                  style={hex ? { backgroundColor: hex } : undefined}
                  title={color}
                  aria-label={`Select color ${color}`}
                  aria-pressed={isSelected}
                >
                  {!hex && (
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold uppercase text-on-surface">
                      {color.slice(0, 2)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size buttons */}
      {hasSizes && (
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant font-medium mb-4">
            Size{selectedSize ? ` — ${selectedSize}` : ''}
          </h3>
          <div className="flex flex-wrap gap-3">
            {uniqueSizes.map((size) => {
              const isSelected = selectedSize === size;
              const isAvailable = availableSizes.includes(size);

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    if (!isAvailable) return;
                    setSelectedSize(size);
                  }}
                  disabled={!isAvailable}
                  className={cn(
                    'px-5 py-2.5 rounded text-sm font-medium transition-all',
                    isSelected
                      ? 'border-2 border-primary bg-surface-container-highest text-on-surface'
                      : 'border border-outline-variant/30 bg-surface-container text-on-surface-variant hover:border-outline-variant hover:text-on-surface',
                    !isAvailable && 'opacity-30 cursor-not-allowed',
                  )}
                  aria-label={`Select size ${size}`}
                  aria-pressed={isSelected}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price adjustment notice */}
      {selectedVariant?.extraPricePkr && parseFloat(selectedVariant.extraPricePkr) > 0 && (
        <p className="text-sm text-primary font-medium">
          + {formatPKR(selectedVariant.extraPricePkr)} for this configuration
        </p>
      )}
    </div>
  );
}
