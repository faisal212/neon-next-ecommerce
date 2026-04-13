import { notFound } from 'next/navigation';
import Image from 'next/image';
import { cacheLife, cacheTag } from 'next/cache';
import { BadgeCheck, Package } from 'lucide-react';
import { getProductBySlug } from '@/lib/services/product.service';
import { NotFoundError } from '@/lib/errors/api-error';
import { ProductConfigurator } from '@/components/store/product/product-configurator';
import { AddToCartPanel } from '@/components/store/product/add-to-cart-panel';
import { ImageGallery } from '@/components/store/product/image-gallery';
import { HeroImage } from '@/components/store/product/hero-image';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Cached only on success. NotFoundError bubbles out uncaught so the 404
// state is never serialized into the cache entry — see
// vercel/next.js#79497 and vercel/next.js#73130.
async function fetchProductCached(slug: string) {
  'use cache';
  cacheLife('days');
  cacheTag(`product-${slug}`);
  return getProductBySlug(slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await fetchProductCached(slug);
    const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];
    const description = product.descriptionEn
      ? product.descriptionEn.slice(0, 160)
      : `Shop ${product.nameEn} at Refine — watches & tech accessories shipped across Pakistan.`;

    return {
      title: product.nameEn,
      description,
      openGraph: {
        title: product.nameEn,
        description,
        type: 'website',
        ...(primary && {
          images: [{ url: primary.url, alt: primary.altText ?? product.nameEn }],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: product.nameEn,
        description,
        ...(primary && { images: [primary.url] }),
      },
    };
  } catch (err) {
    if (err instanceof NotFoundError) return { title: 'Product Not Found' };
    throw err;
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let product: Awaited<ReturnType<typeof getProductBySlug>>;
  try {
    product = await fetchProductCached(slug);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const specTags = product.tags.slice(0, 3);

  // Serializable variant data for client components
  const serializableVariants = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    color: v.color,
    size: v.size,
    extraPricePkr: v.extraPricePkr,
    isActive: v.isActive,
    stock: v.stock,
  }));

  const serializableImages = product.images.map((img) => ({
    id: img.id,
    variantId: img.variantId,
    url: img.url,
    altText: img.altText,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  }));

  return (
    <>
      {/* ── Section 1: Hero (desktop only — mobile goes straight to gallery + cart) ─ */}
      <section className="relative lg:min-h-screen hidden lg:flex lg:flex-row items-center px-4 sm:px-8 lg:px-12 overflow-hidden bg-surface max-w-[1920px] mx-auto">
        {/* Left half */}
        <div className="lg:w-1/2 flex flex-col justify-center pt-8 pb-4 sm:py-20 lg:py-0">
          {/* Status label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary status-glow" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant font-medium">
              {product.isFeatured ? 'New Arrival' : 'Refine Collection'}
            </span>
          </div>

          {/* Product name */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4 text-on-surface">
            {product.nameEn}
          </h1>

          {/* Description */}
          <p className="text-on-surface-variant text-lg max-w-md mb-12 leading-relaxed">
            {product.descriptionEn
              ? product.descriptionEn.slice(0, 200)
              : 'Made with care. Priced without the markup. Delivered anywhere in Pakistan.'}
          </p>

          {/* Quick specs grid */}
          {specTags.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 sm:gap-8 border-l border-outline-variant/20 pl-4 sm:pl-8 mb-8 sm:mb-12">
              {specTags.map((tag, i) => (
                <div key={i}>
                  <span className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest block mb-1">
                    {`0${i + 1}`}
                  </span>
                  <span className="font-bold text-sm sm:text-lg text-on-surface">{tag}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 sm:gap-8 border-l border-outline-variant/20 pl-4 sm:pl-8 mb-8 sm:mb-12">
              {['Nationwide', 'Pay on Delivery', 'Easy Returns'].map((item, i) => (
                <div key={i}>
                  <span className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest block mb-1">
                    {`0${i + 1}`}
                  </span>
                  <span className="font-bold text-sm sm:text-lg text-on-surface">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right half - Hero image (desktop only, mobile uses gallery below) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
          <div className="h-[600px] flex items-center justify-center w-full">
            <HeroImage images={serializableImages} productName={product.nameEn} />
          </div>
        </div>
      </section>

      {/* ── Section 2: Configurator + Add to Cart ───────────── */}
      <section className="bg-surface-container-low pt-6 pb-12 sm:py-24 px-4 sm:px-8 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left: Gallery + Configurator */}
          <div className="lg:col-span-7 space-y-8 lg:space-y-12">
            {serializableImages.length > 0 && (
              <ImageGallery images={serializableImages} />
            )}
            <ProductConfigurator variants={serializableVariants} />
          </div>

          {/* Right: Add to Cart */}
          <div className="lg:col-span-5">
            <AddToCartPanel
              productId={product.id}
              productName={product.nameEn}
              basePricePkr={product.basePricePkr}
              variants={serializableVariants}
            />
          </div>
        </div>
      </section>

      {/* ── Section 3: Specs / Editorial ────────────────────── */}
      <section className="py-16 sm:py-32 px-4 sm:px-8 lg:px-12 bg-surface">
        <div className="max-w-[1400px] mx-auto">
          {/* Editorial headline */}
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none mb-8">
            Craftsmanship without
            <br />
            <span className="text-primary">compromise.</span>
          </h2>

          {/* Description */}
          {product.descriptionEn && (
            <div className="max-w-2xl mb-20">
              {product.descriptionEn.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="text-on-surface-variant text-lg leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </div>
          )}

          {/* Bento feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-highest p-8 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-6">
                <BadgeCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-surface">Made to Last</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Real materials, careful stitching, and the kind of fit and finish you notice on the
                wrist, in the pocket, and on the hanger.
              </p>
            </div>

            <div className="bg-surface-container-highest p-8 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-6">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-surface">Delivered With Care</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Packed properly, shipped across Pakistan, and paid on delivery. No surprises at the
                door — just the piece you ordered, wrapped to arrive how it should.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
