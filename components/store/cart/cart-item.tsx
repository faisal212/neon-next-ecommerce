'use client';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';

import { QuantitySelector } from '@/components/store/quantity-selector';
import { useCart } from '@/lib/store/cart-context';
import { formatPKR } from '@/lib/store/format';
import type { CartItemData } from '@/lib/store/types';

interface CartItemProps {
  item: CartItemData;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const unitPrice = parseFloat(item.unitPricePkr || '0');
  const lineTotal = unitPrice * item.quantity;

  const variantParts = [item.color, item.size].filter(Boolean);
  const variantLabel = variantParts.length > 0 ? variantParts.join(' / ') : null;

  const displayName = item.productName || item.sku || 'Product';

  return (
    <div className="flex gap-4">
      {/* Thumbnail */}
      <div className="relative w-20 h-20 bg-surface-container-highest rounded-lg overflow-hidden flex-shrink-0">
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
            {item.sku?.slice(0, 4) || 'Item'}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-grow min-w-0">
        {/* Top row: name + delete */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-bold text-sm tracking-tight uppercase leading-tight truncate">
            {displayName}
          </span>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="flex-shrink-0 p-1 text-on-surface-variant transition-colors hover:text-destructive"
            aria-label={`Remove ${displayName} from cart`}
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Variant info */}
        {variantLabel && (
          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">
            {variantLabel}
          </span>
        )}

        {/* Bottom row: quantity + price */}
        <div className="flex items-center justify-between mt-auto">
          <QuantitySelector
            value={item.quantity}
            onChange={(qty) => updateQuantity(item.id, qty)}
            min={1}
            max={10}
          />
          <span className="font-bold text-primary-dim text-sm">
            {formatPKR(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
