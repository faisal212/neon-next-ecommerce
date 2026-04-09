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
    <section className="relative min-h-[700px] lg:min-h-[870px] flex items-center overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 w-full z-10 grid grid-cols-12 gap-8">
        {/* Left column */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-center py-20">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
            {subtitle}
          </span>
          <h1 className="text-6xl lg:text-8xl font-black text-on-surface tracking-tighter leading-none mb-6">
            {titleLine1}
            {titleLine2 && (
              <>
                <br />
                <span className="text-primary-dim">{titleLine2}</span>
              </>
            )}
          </h1>
          <p className="text-lg text-on-surface-variant max-w-md mb-10 leading-relaxed">
            {description}
          </p>
          <div className="flex gap-4">
            <Link
              href={ctaHref}
              className="gradient-button inline-flex items-center justify-center text-on-primary-fixed px-10 py-4 font-bold rounded-lg transition-all"
            >
              Shop Now
            </Link>
            <Link
              href="/categories"
              className="border border-outline-variant/30 text-on-surface px-10 py-4 font-bold rounded-lg hover:bg-white/5 transition-all"
            >
              Explore Categories
            </Link>
          </div>
        </div>

        {/* Right column - hero image */}
        <div className="hidden lg:flex lg:col-span-6 relative items-center justify-center">
          {banner?.imageUrl ? (
            <div className="relative w-full h-[600px] rounded-xl overflow-hidden">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1024px) 0vw, 50vw"
              />
            </div>
          ) : (
            <div className="relative w-full h-[600px] bg-surface-container rounded-xl flex flex-col items-center justify-center gap-4">
              <ShoppingBag size={64} className="text-on-surface-variant/30" />
              <span className="text-on-surface-variant/50 text-sm uppercase tracking-widest font-bold">
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
