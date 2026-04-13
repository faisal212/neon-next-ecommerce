import Link from "next/link";
import Image from "next/image";
import { SectionHeader } from "@/components/store/section-header";

const GRID_CONFIG = [
  { span: "md:col-span-2 md:row-span-2", titleSize: "text-3xl", showButton: true },
  { span: "md:col-span-2", titleSize: "text-2xl", showButton: false },
  { span: "", titleSize: "text-lg", showButton: false },
  { span: "", titleSize: "text-lg", showButton: false },
];

const FALLBACK_CATEGORIES = [
  { nameEn: "Watches", slug: "watches", imageUrl: null, productCount: 0 },
  { nameEn: "Kurtas", slug: "kurtas", imageUrl: null, productCount: 0 },
  { nameEn: "Menswear", slug: "menswear", imageUrl: null, productCount: 0 },
  { nameEn: "Womenswear", slug: "womenswear", imageUrl: null, productCount: 0 },
];

interface EcosystemCategory {
  nameEn: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
}

interface EcosystemGridProps {
  categories?: EcosystemCategory[];
}

export function EcosystemGrid({ categories }: EcosystemGridProps) {
  const cats = categories && categories.length >= 4 ? categories : FALLBACK_CATEGORIES;

  return (
    <section className="py-24 max-w-[1440px] mx-auto px-8">
      <SectionHeader
        title="The Ecosystem"
        description="Seamlessly connected technology for your lifestyle."
        action={{ text: "Explore All", href: "/categories" }}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[700px]">
        {cats.slice(0, 4).map((cat, i) => {
          const config = GRID_CONFIG[i];
          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className={`${config.span} bg-surface-container rounded-lg overflow-hidden group relative flex flex-col justify-end p-8 min-h-[200px] transition-all duration-500 hover:bg-surface-container-high`}
            >
              {/* Background image or solid bg */}
              {cat.imageUrl ? (
                <>
                  <Image
                    src={cat.imageUrl}
                    alt={cat.nameEn}
                    fill
                    priority={i === 0}
                    className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                    sizes={
                      config.span.includes("row-span-2")
                        ? "(max-width: 768px) 100vw, (max-width: 1440px) 50vw, 680px"
                        : "(max-width: 768px) 100vw, (max-width: 1440px) 25vw, 332px"
                    }
                  />
                  {/* Scrim — keeps title/CTA readable regardless of image brightness */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-surface-container-highest opacity-30" />
              )}
              {/* Content overlay */}
              <div className="relative z-10">
                <h3 className={`${config.titleSize} font-bold mb-1`}>{cat.nameEn}</h3>
                {cat.productCount > 0 && (
                  <p className="text-on-surface-variant text-sm">
                    {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                  </p>
                )}
                {config.showButton && (
                  <span className="inline-block mt-4 bg-white text-black px-6 py-2 font-bold rounded-lg text-sm">
                    Discover
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
