import { notFound } from 'next/navigation';
import Image from 'next/image';
import { cacheLife, cacheTag } from 'next/cache';
import { Cog, Zap } from 'lucide-react';
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return getProductMetadata(slug);
}

async function getProductMetadata(slug: string): Promise<Metadata> {
  'use cache';
  cacheLife('hours');
  cacheTag(`product-${slug}`);

  try {
    const product = await getProductBySlug(slug);
    return {
      title: product.nameEn,
      description: product.descriptionEn
        ? product.descriptionEn.slice(0, 160)
        : `Shop ${product.nameEn} at Cover - Pakistan's premium tech store.`,
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProductDetailContent slug={slug} />;
}

async function ProductDetailContent({ slug }: { slug: string }) {
  'use cache';
  cacheLife('hours');
  cacheTag(`product-${slug}`);

  let product: Awaited<ReturnType<typeof getProductBySlug>>;
  try {
    product = await getProductBySlug(slug);
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
      {/* ── Section 1: Hero ─────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col lg:flex-row items-center px-8 lg:px-12 overflow-hidden bg-surface max-w-[1920px] mx-auto">
        {/* Left half */}
        <div className="lg:w-1/2 flex flex-col justify-center py-20 lg:py-0">
          {/* Status label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary status-glow" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant font-medium">
              {product.isFeatured ? 'New Release' : 'Cover Store'}
            </span>
          </div>

          {/* Product name */}
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4 text-on-surface">
            {product.nameEn}
          </h1>

          {/* Description */}
          <p className="text-on-surface-variant text-lg max-w-md mb-12 leading-relaxed">
            {product.descriptionEn
              ? product.descriptionEn.slice(0, 200)
              : 'Premium quality, engineered for the modern lifestyle.'}
          </p>

          {/* Quick specs grid */}
          {specTags.length > 0 ? (
            <div className="grid grid-cols-3 gap-8 border-l border-outline-variant/20 pl-8 mb-12">
              {specTags.map((tag, i) => (
                <div key={i}>
                  <span className="text-[10px] uppercase text-on-surface-variant tracking-widest block mb-1">
                    {i === 0 ? 'Spec' : i === 1 ? 'Feature' : 'Detail'}
                  </span>
                  <span className="font-bold text-lg text-on-surface">{tag}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8 border-l border-outline-variant/20 pl-8 mb-12">
              {['Premium Build', 'Fast Delivery', '2yr Warranty'].map((item, i) => (
                <div key={i}>
                  <span className="text-[10px] uppercase text-on-surface-variant tracking-widest block mb-1">
                    {i === 0 ? 'Quality' : i === 1 ? 'Shipping' : 'Coverage'}
                  </span>
                  <span className="font-bold text-lg text-on-surface">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right half - Hero image */}
        <div className="lg:w-1/2 flex items-center justify-center">
          <div className="h-[400px] lg:h-[600px] flex items-center justify-center w-full">
            <HeroImage images={serializableImages} productName={product.nameEn} />
          </div>
        </div>
      </section>

      {/* ── Section 2: Configurator + Add to Cart ───────────── */}
      <section className="bg-surface-container-low py-24 px-8 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Gallery + Configurator */}
          <div className="lg:col-span-7 space-y-12">
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
      <section className="py-32 px-8 lg:px-12 bg-surface">
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
                <Cog className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-surface">Precision Engineered</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Every detail is meticulously crafted with premium materials and rigorous quality
                control, ensuring a product that performs flawlessly day after day.
              </p>
            </div>

            <div className="bg-surface-container-highest p-8 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-surface">Built for Performance</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Optimized internals and cutting-edge technology deliver lightning-fast responsiveness
                and efficiency that keeps pace with your demanding lifestyle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
