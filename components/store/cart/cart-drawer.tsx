'use client';

import { ShoppingCart } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { EmptyState } from '@/components/store/empty-state';
import { useCart } from '@/lib/store/cart-context';

import { CartItem } from './cart-item';
import { CartSummary } from './cart-summary';

export function CartDrawer() {
  const { items, itemCount, isOpen, closeCart } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="bg-surface border-l border-outline-variant/15 flex flex-col w-full max-w-md !p-0 !gap-0"
      >
        {/* Header */}
        <SheetHeader className="!p-0 !gap-0 border-b border-outline-variant/10">
          <div className="flex items-center gap-3 px-6 py-5 w-full">
            <ShoppingCart className="text-primary flex-shrink-0" size={20} />
            <SheetTitle className="text-lg font-black tracking-tighter uppercase">
              Your Selection
            </SheetTitle>
            {itemCount > 0 && (
              <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-[10px] font-bold text-on-primary-fixed">
                {itemCount}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<ShoppingCart size={32} />}
              title="Your cart is empty"
              description="Start exploring our collection"
              action={{ label: 'Browse Collection', href: '/' }}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && <CartSummary />}
      </SheetContent>
    </Sheet>
  );
}
