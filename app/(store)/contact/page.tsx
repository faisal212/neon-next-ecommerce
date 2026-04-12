import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { MapPin, Mail, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ContactForm } from "./_components/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Cover. We're here to help with orders, products, and everything tech. Reach us via email, phone, or visit our office in Lahore.",
};

const contactInfo = [
  {
    icon: MapPin,
    label: "Head Office",
    value: "Lahore, Punjab, Pakistan",
  },
  {
    icon: Mail,
    label: "Email",
    value: "contact@refine.pk",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+92 (42) 111-COVER",
  },
];

export default async function ContactPage() {
  "use cache";
  cacheLife("max");
  cacheTag("static-contact");

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      />

      <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
        {/* Left Column - Info */}
        <div className="lg:col-span-5">
          <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Connect with us
          </span>

          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            GET IN
            <br />
            <span className="text-primary-fixed">TOUCH.</span>
          </h1>

          <p className="mt-6 max-w-md text-on-surface-variant leading-relaxed">
            Have a question about an order, need product advice, or just want to
            say hello? Our team is ready to help you find exactly what you need.
          </p>

          <div className="mt-12 flex flex-col gap-8">
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest transition-colors hover:bg-primary/10">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {item.label}
                  </p>
                  <p className="mt-1 text-on-surface">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-7">
          <div className="glass-panel relative overflow-hidden rounded-xl p-8 md:p-12">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
