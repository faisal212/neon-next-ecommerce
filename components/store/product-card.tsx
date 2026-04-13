import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PriceDisplay } from "./price-display";

interface ProductCardProps {
  product: {
    nameEn: string;
    slug: string;
    basePricePkr: string;
    category?: { nameEn: string };
    images?: { url: string; altText: string | null; isPrimary: boolean }[];
  };
  variantLabel?: string;
  variantId?: string;
  displayPrice?: string;
  image?: { url: string; altText: string | null } | null;
  /** Must match the actual rendered width at each breakpoint — callers
   *  render this card in different grids (1-col, 2-col, 3-col, carousel). */
  sizes?: string;
}

export function ProductCard({ product, variantLabel, variantId, displayPrice, image, sizes = "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw" }: ProductCardProps) {
  const fallbackImage =
    product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const displayImage = image ?? fallbackImage;

  const href = variantId
    ? `/products/${product.slug}#variant=${variantId}`
    : `/products/${product.slug}`;

  return (
    <Link
      href={href}
      className="group flex h-full w-full flex-col overflow-hidden rounded-lg bg-surface-container transition-all duration-300 hover:bg-surface-container-high"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-container-low">
        {displayImage ? (
          <Image
            src={displayImage.url}
            alt={displayImage.altText ?? product.nameEn}
            fill
            className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
            sizes={sizes}
          />
        ) : (
          <div className="absolute inset-0 bg-surface-container-highest" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {product.category && (
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
            {product.category.nameEn}
          </span>
        )}
        <h3 className="mb-1 text-sm font-bold text-white sm:text-lg">
          {product.nameEn}
        </h3>
        {variantLabel && (
          <span className="mb-2 block text-xs text-on-surface-variant">
            {variantLabel}
          </span>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <PriceDisplay amount={displayPrice ?? product.basePricePkr} />
          <ArrowRight
            size={16}
            className="text-primary transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}
