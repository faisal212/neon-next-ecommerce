'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageData {
  id: string;
  variantId: string | null;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface ImageGalleryProps {
  images: ImageData[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const prevVariantRef = useRef(selectedVariantId);

  // Listen for variant changes from ProductConfigurator
  useEffect(() => {
    function handleVariantChange(e: Event) {
      const variantId = (e as CustomEvent).detail as string | null;
      setSelectedVariantId(variantId);
    }
    window.addEventListener('pdp:variant-change', handleVariantChange);
    return () => window.removeEventListener('pdp:variant-change', handleVariantChange);
  }, []);

  const allSorted = useMemo(() => {
    return [...images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.sortOrder - b.sortOrder;
    });
  }, [images]);

  // Filter images: variant-specific + shared (null variantId)
  const filteredImages = useMemo(() => {
    if (!selectedVariantId) return allSorted;
    return allSorted.filter(
      (img) => !img.variantId || img.variantId === selectedVariantId,
    );
  }, [allSorted, selectedVariantId]);

  // Reset to first image when variant changes
  if (prevVariantRef.current !== selectedVariantId) {
    prevVariantRef.current = selectedVariantId;
    if (activeIndex !== 0) setActiveIndex(0);
  }

  // Scroll main carousel to the first slide when variant changes
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: 0, behavior: 'smooth' });
  }, [selectedVariantId]);

  // IntersectionObserver — detect which slide is currently visible
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!Number.isNaN(index)) setActiveIndex(index);
          }
        }
      },
      { root: container, threshold: 0.6 },
    );

    const slides = container.querySelectorAll('[data-index]');
    slides.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredImages]);

  // Auto-scroll thumbnail strip to keep active thumb visible
  useEffect(() => {
    const strip = thumbRef.current;
    if (!strip) return;
    const activeThumb = strip.children[activeIndex] as HTMLElement | undefined;
    if (!activeThumb) return;
    activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeIndex]);

  const scrollToSlide = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: index * container.clientWidth, behavior: 'smooth' });
  }, []);

  if (filteredImages.length === 0) {
    return (
      <div className="aspect-square relative rounded-lg overflow-hidden bg-surface-container flex items-center justify-center">
        <span className="text-on-surface-variant text-sm">No images available</span>
      </div>
    );
  }

  return (
    <div>
      {/* Main image carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-lg bg-surface-container mb-4"
      >
        {filteredImages.map((img, index) => (
          <div
            key={img.id}
            data-index={index}
            className="w-full flex-shrink-0 snap-start aspect-square relative"
          >
            <Image
              src={img.url}
              alt={img.altText ?? 'Product image'}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-contain p-4"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Thumbnail strip */}
      {filteredImages.length > 1 && (
        <div ref={thumbRef} className="flex gap-3 overflow-x-auto no-scrollbar">
          {filteredImages.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => scrollToSlide(index)}
              className={cn(
                'relative w-16 h-16 rounded overflow-hidden flex-shrink-0 transition-all',
                'border-2',
                index === activeIndex
                  ? 'border-primary'
                  : 'border-transparent hover:border-outline-variant/50',
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `Product thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
