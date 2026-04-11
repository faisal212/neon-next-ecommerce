import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Truck, Package, MapPin, Clock, CreditCard, BadgeCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/store/breadcrumbs";

export const metadata: Metadata = {
  title: "Shipping Information",
  description:
    "Learn about Cover's shipping options, delivery areas, timelines, and free shipping policy. We deliver across all major cities in Pakistan.",
};

const shippingOptions = [
  {
    icon: Truck,
    title: "Express Delivery",
    time: "2-3 Business Days",
    description:
      "Available for Lahore, Karachi, and Islamabad. Priority handling with real-time tracking updates.",
    price: "Rs. 250",
  },
  {
    icon: Package,
    title: "Standard Delivery",
    time: "3-5 Business Days",
    description:
      "Available nationwide. Reliable delivery to all major cities and towns across Pakistan.",
    price: "Rs. 150",
  },
];

const cities = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
];

export default async function ShippingPage() {
  "use cache";
  cacheLife("max");
  cacheTag("static-shipping");

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Shipping" }]}
      />

      <div className="mt-16 max-w-3xl">
        <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Logistics
        </span>
        <h1 className="text-5xl font-black tracking-tight md:text-6xl">
          Shipping Information
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
          We deliver across Pakistan with speed and care. Every order is
          professionally packaged and tracked from our warehouse to your
          doorstep.
        </p>
      </div>

      {/* Shipping Options */}
      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
        {shippingOptions.map((option) => (
          <div
            key={option.title}
            className="rounded-lg bg-surface-container p-8 transition-colors hover:bg-surface-container-high"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <option.icon size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black">{option.title}</h3>
                <p className="mt-1 text-sm font-bold text-primary">
                  {option.time}
                </p>
              </div>
            </div>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              {option.description}
            </p>
            <p className="mt-4 text-sm font-bold text-on-surface">
              Shipping fee: {option.price}
            </p>
          </div>
        ))}
      </div>

      {/* Free Shipping */}
      <div className="mt-12 rounded-lg bg-primary/5 border border-primary/10 p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <BadgeCheck size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black">Free Shipping</h3>
            <p className="mt-2 leading-relaxed text-on-surface-variant">
              Enjoy <span className="font-bold text-primary">free delivery</span>{" "}
              on all orders above{" "}
              <span className="font-bold text-on-surface">Rs. 5,000</span>.
              Applies to both Express and Standard shipping across Pakistan.
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-surface-container-low p-8">
          <Clock size={24} className="text-primary" />
          <h3 className="mt-4 text-lg font-black">Order Processing</h3>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            Orders placed before 2:00 PM are processed the same day. Orders
            after 2:00 PM are processed the next business day.
          </p>
        </div>

        <div className="rounded-lg bg-surface-container-low p-8">
          <CreditCard size={24} className="text-primary" />
          <h3 className="mt-4 text-lg font-black">Cash on Delivery</h3>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            COD is available across Pakistan. Pay in cash when your order
            arrives. A nominal COD fee of Rs. 50 applies.
          </p>
        </div>

        <div className="rounded-lg bg-surface-container-low p-8">
          <Package size={24} className="text-primary" />
          <h3 className="mt-4 text-lg font-black">Order Tracking</h3>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            Track your order in real-time from dispatch to delivery. You will
            receive SMS and email notifications at every step.
          </p>
        </div>
      </div>

      {/* Delivery Areas */}
      <div className="mt-16">
        <div className="flex items-start gap-4">
          <MapPin size={24} className="mt-1 shrink-0 text-primary" />
          <div>
            <h2 className="text-2xl font-black">Delivery Areas</h2>
            <p className="mt-2 text-on-surface-variant">
              We deliver to all major cities and towns across Pakistan,
              including:
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {cities.map((city) => (
            <div
              key={city}
              className="rounded-lg bg-surface-container px-4 py-3 text-center text-sm font-medium"
            >
              {city}
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-on-surface-variant">
          Don&apos;t see your city? We likely deliver there too. Contact us at{" "}
          <span className="text-primary">contact@refine.pk</span> to confirm
          delivery availability for your area.
        </p>
      </div>
    </section>
  );
}
