'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';

export function CartTrigger() {
  const { itemCount, toggleCart } = useCart();

  return (
    <button
      type="button"
      aria-label={`Cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
      onClick={toggleCart}
      className="text-on-surface-variant hover:text-primary transition-colors relative p-2"
    >
      <ShoppingCart size={20} />
      {itemCount > 0 && (
        <span className="w-2 h-2 bg-primary rounded-full absolute top-0 right-0 status-glow" />
      )}
    </button>
  );
}
