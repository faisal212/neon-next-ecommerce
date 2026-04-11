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
      className="relative p-2 text-on-surface-variant transition-colors hover:text-primary"
    >
      <ShoppingCart size={20} />
      {itemCount > 0 && (
        <span className="status-glow absolute right-0 top-0 h-2 w-2 rounded-full bg-primary" />
      )}
    </button>
  );
}
