'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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

  const [activeIndex, setActiveIndex] = useState(0);
  const prevVariantRef = useRef(selectedVariantId);

  // Reset to first image when variant actually changes
  if (prevVariantRef.current !== selectedVariantId) {
    prevVariantRef.current = selectedVariantId;
    if (activeIndex !== 0) setActiveIndex(0);
  }

  // Clamp index if filtered list shrinks
  const safeIndex = Math.min(activeIndex, Math.max(filteredImages.length - 1, 0));
  const activeImage = filteredImages[safeIndex];

  if (filteredImages.length === 0) {
    return (
      <div className="aspect-square relative rounded-lg overflow-hidden bg-surface-container flex items-center justify-center">
        <span className="text-on-surface-variant text-sm">No images available</span>
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="aspect-square relative rounded-lg overflow-hidden bg-surface-container mb-4">
        {activeImage && (
          <Image
            src={activeImage.url}
            alt={activeImage.altText ?? 'Product image'}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-contain p-4"
            priority={safeIndex === 0}
          />
        )}
      </div>

      {/* Thumbnail strip */}
      {filteredImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {filteredImages.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative w-16 h-16 rounded overflow-hidden flex-shrink-0 transition-all',
                'border-2',
                index === safeIndex
                  ? 'border-primary'
                  : 'border-transparent hover:border-outline-variant/50',
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={index === safeIndex ? 'true' : undefined}
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
