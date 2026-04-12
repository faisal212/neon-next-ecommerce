import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { SectionHeader } from "@/components/store/section-header";
import { Zap, Clock, Tag } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Flash Sales",
};

const placeholderSales = [
  {
    name: "Weekend Blitz",
    discount: "Up to 40% OFF",
    description: "Premium wearables and audio at unbeatable prices.",
    endsIn: "2 days",
    products: [
      { name: "Smart Watch Pro", original: "Rs. 24,900", sale: "Rs. 14,900", off: "40%" },
      { name: "Wireless Earbuds", original: "Rs. 8,500", sale: "Rs. 5,100", off: "40%" },
      { name: "Bluetooth Speaker", original: "Rs. 12,000", sale: "Rs. 8,400", off: "30%" },
    ],
  },
];

export default async function FlashSalesPage() {
  "use cache";
  cacheLife("days");
  cacheTag("flash-sales");

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Flash Sales" }]} />

      <div className="mt-8">
        <SectionHeader
          label="Limited Time"
          title="Flash Sales"
          description="Don't miss out on these incredible deals. Limited stock available."
        />
      </div>

      {placeholderSales.map((sale, i) => (
        <section key={i} className="mb-16">
          {/* Sale header */}
          <div className="bg-surface-container rounded-xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Zap size={20} className="text-primary" />
                <span className="text-primary font-black uppercase tracking-widest text-sm">
                  {sale.name}
                </span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter mb-2">
                {sale.discount}
              </h2>
              <p className="text-on-surface-variant mb-4">{sale.description}</p>
              <div className="flex items-center gap-2 text-sm text-tertiary">
                <Clock size={16} />
                <span className="font-bold">Ends in {sale.endsIn}</span>
              </div>
            </div>
          </div>

          {/* Sale products */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sale.products.map((product, j) => (
              <Link
                key={j}
                href="/products"
                className="group bg-surface-container rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:bg-surface-container-high"
              >
                {/* Image placeholder */}
                <div className="aspect-square relative bg-surface-container-low flex items-center justify-center">
                  <Tag size={40} className="text-on-surface-variant/20" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-destructive text-white text-[10px] font-black px-2 py-1 rounded-sm">
                      {product.off} OFF
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">
                      {product.sale}
                    </span>
                    <span className="text-sm text-on-surface-variant line-through">
                      {product.original}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
