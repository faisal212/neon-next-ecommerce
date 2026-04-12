'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

interface NewArrivalsCarouselProps {
  children: React.ReactNode;
}

export function NewArrivalsCarousel({ children }: NewArrivalsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hasPlayed = useRef(false);
  const animFrameRef = useRef(0);
  const hasItems = React.Children.count(children) > 0;

  const cancelAutoScroll = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
      // Re-enable scroll-snap after cancellation
      if (scrollRef.current) scrollRef.current.style.scrollSnapType = '';
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    cancelAutoScroll();
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -340 : 340,
      behavior: 'smooth',
    });
  };

  // Auto-scroll showcase: scroll right → pause → scroll left (one-shot)
  useEffect(() => {
    const section = sectionRef.current;
    const container = scrollRef.current;
    if (!section || !container || !hasItems) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Cancel on any user interaction
    const abort = () => cancelAutoScroll();
    container.addEventListener('touchstart', abort, { passive: true });
    container.addEventListener('wheel', abort, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasPlayed.current) return;
        hasPlayed.current = true;
        observer.disconnect();

        // Delay before starting
        const startTimer = setTimeout(() => {
          if (!scrollRef.current) return;
          const el = scrollRef.current!;
          const maxScroll = el.scrollWidth - el.clientWidth;
          if (maxScroll <= 0) return;

          // Disable scroll-snap during animation (it fights scrollLeft increments)
          el.style.scrollSnapType = 'none';

          const speed = 1.5; // px per frame (~90px/s at 60fps)
          const totalRounds = 3;
          let currentRound = 0;

          // Phase 1: scroll right
          function scrollRight() {
            if (el.scrollLeft >= maxScroll - 1) {
              const pauseTimer = setTimeout(scrollLeftPhase, 1000);
              (el as unknown as Record<string, unknown>).__pauseTimer = pauseTimer;
              return;
            }
            el.scrollLeft += speed;
            animFrameRef.current = requestAnimationFrame(scrollRight);
          }

          // Phase 2: scroll left (back to start)
          function scrollLeftPhase() {
            if (el.scrollLeft <= 0) {
              currentRound++;
              if (currentRound < totalRounds) {
                // Pause then start next round
                const pauseTimer = setTimeout(scrollRight, 800);
                (el as unknown as Record<string, unknown>).__pauseTimer = pauseTimer;
                return;
              }
              // All rounds done
              el.style.scrollSnapType = ''; // re-enable snap
              animFrameRef.current = 0;
              return;
            }
            el.scrollLeft -= speed * 1.5; // slightly faster return
            animFrameRef.current = requestAnimationFrame(scrollLeftPhase);
          }

          animFrameRef.current = requestAnimationFrame(scrollRight);
        }, 600);

        // Store timer for cleanup
        (section as unknown as Record<string, unknown>).__startTimer = startTimer;
      },
      { threshold: 0.3 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      cancelAutoScroll();
      clearTimeout((section as unknown as Record<string, number>).__startTimer);
      clearTimeout((container as unknown as Record<string, number>).__pauseTimer);
      container.removeEventListener('touchstart', abort);
      container.removeEventListener('wheel', abort);
    };
  }, [hasItems, cancelAutoScroll]);

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-surface-container-low">
      <div className="max-w-[1440px] mx-auto px-4 md:px-0 mb-8 sm:mb-12 flex justify-between items-center">
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
