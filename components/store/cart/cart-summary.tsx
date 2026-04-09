'use client';

import Link from 'next/link';

import { useCart } from '@/lib/store/cart-context';
import { formatPKR } from '@/lib/store/format';

export function CartSummary() {
  const { subtotal, closeCart } = useCart();

  return (
    <div className="bg-surface-container-low p-6 space-y-4">
      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          Subtotal
        </span>
        <span className="font-bold">{formatPKR(subtotal)}</span>
      </div>

      {/* Shipping */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          Shipping
        </span>
        <span className="text-primary-dim text-[10px] font-bold uppercase">
          Calculated at checkout
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-outline-variant/10 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-black tracking-tighter uppercase">
            Total
          </span>
          <span className="text-xl font-black text-white">
            {formatPKR(subtotal)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/checkout"
        onClick={closeCart}
        className="gradient-button w-full py-4 text-on-primary-fixed font-black uppercase tracking-[0.15em] text-sm rounded-lg shadow-[0_10px_30px_rgba(255,103,0,0.2)] text-center block"
      >
        Proceed to Checkout
      </Link>

      {/* Free shipping notice */}
      <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-widest">
        Free shipping on orders over Rs. 5,000
      </p>
    </div>
  );
}
