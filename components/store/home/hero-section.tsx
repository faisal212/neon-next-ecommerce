import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

interface HeroBanner {
  title: string;
  titleHighlight: string | null;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
}

interface HeroSectionProps {
  banner?: HeroBanner | null;
}

export function HeroSection({ banner }: HeroSectionProps) {
  const titleLine1 = banner?.title || "Discover";
  const titleLine2 = banner?.titleHighlight || "Innovation";
  const subtitle = banner?.subtitle || "Premium Tech Store";
  const description =
    banner?.description ||
    "Pakistan\u2019s most premium selection of technology. From smartphones to smart home, experience the future delivered to your door.";
  const ctaHref = banner?.linkUrl || "/products";

  return (
    <section className="relative flex items-center overflow-hidden lg:min-h-[870px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid grid-cols-12 gap-6 lg:gap-8 py-12 sm:py-16 lg:py-20">
        {/* Left column - copy */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-center order-2 lg:order-1">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 sm:mb-4 block">
            {subtitle}
          </span>
          <h1 className="text-[2.75rem] sm:text-6xl lg:text-8xl font-black text-on-surface tracking-tighter leading-[0.85] mb-5 sm:mb-6">
            {titleLine1}
            {titleLine2 && (
              <span className="block text-primary-dim">{titleLine2}</span>
            )}
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant max-w-md mb-8 sm:mb-10 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href={ctaHref}
              className="gradient-button inline-flex items-center justify-center text-on-primary-fixed px-8 sm:px-10 py-4 font-bold rounded-lg transition-all"
            >
              Shop Now
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center border border-outline-variant/30 text-on-surface px-8 sm:px-10 py-4 font-bold rounded-lg hover:bg-white/5 transition-all"
            >
              Explore Categories
            </Link>
          </div>
        </div>

        {/* Right column - hero image */}
        <div className="col-span-12 lg:col-span-6 relative flex items-center justify-center order-1 lg:order-2">
          {banner?.imageUrl ? (
            <div className="group/hero relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[600px] rounded-xl overflow-hidden">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                preload
                fill
                className="object-contain transition-all duration-700 ease-out group-hover/hero:scale-[1.03] group-hover/hero:-translate-y-2 group-hover/hero:drop-shadow-[0_0_40px_rgba(255,145,92,0.3)]"
                sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), (max-width: 1440px) calc(50vw - 48px), 672px"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[600px] bg-surface-container rounded-xl flex flex-col items-center justify-center gap-4">
              <ShoppingBag size={56} className="text-on-surface-variant/30 sm:hidden" />
              <ShoppingBag size={64} className="hidden sm:block text-on-surface-variant/30" />
              <span className="text-on-surface-variant/50 text-xs sm:text-sm uppercase tracking-widest font-bold">
                Featured Product
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
    </section>
  );
}
