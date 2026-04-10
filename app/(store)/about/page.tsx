import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Zap, Shield, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/store/breadcrumbs";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Cover - Pakistan's premium tech store. Our mission is to bring world-class technology to your doorstep with unmatched quality and service.",
};

const values = [
  {
    icon: Zap,
    title: "Innovation",
    description:
      "We curate the latest and most innovative tech products from around the globe, ensuring you always have access to cutting-edge technology that enhances your daily life.",
  },
  {
    icon: Shield,
    title: "Quality",
    description:
      "Every product in our collection undergoes rigorous quality checks. We partner only with authorized distributors to guarantee 100% genuine products with full warranties.",
  },
  {
    icon: Truck,
    title: "Delivery",
    description:
      "From Karachi to Islamabad and everywhere in between, we deliver across Pakistan with express shipping options. Free delivery on orders above Rs. 5,000.",
  },
];

export default async function AboutPage() {
  "use cache";
  cacheLife("max");
  cacheTag("static-about");

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      {/* Hero */}
      <div className="mt-16 max-w-3xl">
        <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Our Story
        </span>
        <h1 className="text-5xl font-black tracking-tight md:text-7xl">
          About <span className="text-primary-fixed">Cover</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
          Cover is Pakistan&apos;s premium destination for technology and
          lifestyle products. Founded with a singular vision — to bring the
          world&apos;s finest tech to every doorstep in Pakistan — we&apos;ve
          built a curated marketplace that prioritises quality, authenticity, and
          an uncompromising customer experience.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
          From flagship smartphones and premium wearables to smart home
          ecosystems and audiophile-grade sound, our collection represents the
          pinnacle of modern technology. Every product is hand-selected by our
          team of tech enthusiasts who believe that great technology should be
          accessible to everyone.
        </p>
      </div>

      {/* Mission Section */}
      <div className="mt-24">
        <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          What Drives Us
        </span>
        <h2 className="mb-16 text-4xl font-black tracking-tight">
          Our Values
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-lg bg-surface-container p-8 transition-colors hover:bg-surface-container-high"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <value.icon size={24} className="text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-black">{value.title}</h3>
              <p className="mt-3 leading-relaxed text-on-surface-variant">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Numbers */}
      <div className="mt-24 grid grid-cols-2 gap-6 md:grid-cols-4">
        {[
          { stat: "50K+", label: "Happy Customers" },
          { stat: "500+", label: "Products" },
          { stat: "120+", label: "Cities Covered" },
          { stat: "24/7", label: "Support" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg bg-surface-container-low p-8 text-center"
          >
            <p className="text-3xl font-black text-primary">{item.stat}</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
