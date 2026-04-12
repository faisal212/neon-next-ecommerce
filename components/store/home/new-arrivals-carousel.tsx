'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

interface NewArrivalsCarouselProps {
  children: React.ReactNode;
}

export function NewArrivalsCarousel({ children }: NewArrivalsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasItems = React.Children.count(children) > 0;

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -340 : 340,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-16 sm:py-24 bg-surface-container-low">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 mb-8 sm:mb-12 flex justify-between items-center">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">New Arrivals</h2>
        {hasItems && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-11 h-11 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-11 h-11 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {hasItems ? (
        <div
          ref={scrollRef}
          className="flex items-stretch overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-8 no-scrollbar scroll-smooth pb-8 max-w-[1440px] mx-auto snap-x snap-mandatory"
        >
          {React.Children.map(children, (child) => (
            <div className="w-[44%] sm:w-[300px] flex-shrink-0 flex snap-start">{child}</div>
          ))}
        </div>
      ) : (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag size={48} className="text-on-surface-variant/30 mb-4" />
          <p className="text-on-surface-variant text-lg font-semibold">Products coming soon</p>
          <p className="text-on-surface-variant/60 text-sm mt-1">
            We&apos;re adding products to this collection. Check back shortly.
          </p>
        </div>
      )}
    </section>
  );
}
