'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface HeroImageData {
  id: string;
  variantId: string | null;
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

interface HeroImageProps {
  images: HeroImageData[];
  productName: string;
}

export function HeroImage({ images, productName }: HeroImageProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    function handleVariantChange(e: Event) {
      setSelectedVariantId((e as CustomEvent).detail as string | null);
    }
    window.addEventListener('pdp:variant-change', handleVariantChange);
    return () => window.removeEventListener('pdp:variant-change', handleVariantChange);
  }, []);

  const heroImage = useMemo(() => {
    if (selectedVariantId) {
      // Find primary image for this variant, or first image for this variant
      const variantImages = images.filter((img) => img.variantId === selectedVariantId);
      const primary = variantImages.find((img) => img.isPrimary);
      if (primary) return primary;
      if (variantImages.length > 0) return variantImages[0];
    }
    // Fallback: overall primary, or first image
    return images.find((img) => img.isPrimary) ?? images[0] ?? null;
  }, [images, selectedVariantId]);

  if (!heroImage) {
    return (
      <div className="w-full h-full rounded-lg bg-surface-container-high flex items-center justify-center">
        <span className="text-on-surface-variant text-sm">No image available</span>
      </div>
    );
  }

  return (
    <Image
      src={heroImage.url}
      alt={heroImage.altText ?? productName}
      width={800}
      height={800}
      priority
      className="object-contain h-full w-full drop-shadow-[0_0_80px_rgba(255,103,0,0.15)]"
    />
  );
}
