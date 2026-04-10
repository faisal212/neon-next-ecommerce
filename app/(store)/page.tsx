import { cacheLife, cacheTag } from "next/cache";
import { HeroSection } from "@/components/store/home/hero-section";
import { EcosystemGrid } from "@/components/store/home/ecosystem-grid";
import { NewArrivalsCarousel } from "@/components/store/home/new-arrivals-carousel";
import { getActiveBanners } from "@/lib/services/banner.service";
import { listEcosystemCategories } from "@/lib/services/category.service";
import { listProductVariants } from "@/lib/services/product.service";
import { ProductCard } from "@/components/store/product-card";

export default async function HomePage() {
  "use cache";
  cacheLife("minutes");
  cacheTag("homepage");

  const [banners, ecosystemCategories, products] = await Promise.all([
    getActiveBanners("homepage").catch(() => []),
    listEcosystemCategories().catch(() => []),
    listProductVariants({}, { page: 1, limit: 8, offset: 0 }).catch(() => ({ data: [], total: 0 })),
  ]);

  const heroBanner = banners[0] ?? null;

  return (
    <>
      <HeroSection banner={heroBanner} />
      <EcosystemGrid categories={ecosystemCategories} />
      <NewArrivalsCarousel>
        {products.data.map((p) => (
          <ProductCard
            key={p.variantId}
            product={{
              nameEn: p.nameEn,
              slug: p.slug,
              basePricePkr: p.basePricePkr,
              category: p.category,
            }}
            variantLabel={p.variantLabel ?? undefined}
            variantId={p.variantId}
            displayPrice={p.totalPricePkr}
            image={p.image}
          />
        ))}
      </NewArrivalsCarousel>
    </>
  );
}
