import Link from "next/link";
import { Globe, Mail } from "lucide-react";
import { getNavCategories } from "@/lib/services/category.service";

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping Info", href: "/shipping" },
  { label: "FAQ", href: "/faq" },
  { label: "Returns Policy", href: "/returns-policy" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Shipping", href: "/shipping" },
];

const paymentMethods = ["COD", "JazzCash", "EasyPaisa"];

export async function StoreFooter() {
  const productLinks = (await getNavCategories()).slice(0, 4);

  return (
    <footer className="bg-surface w-full pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1 - Brand */}
          <div className="flex flex-col gap-5">
            <span className="text-primary font-bold uppercase tracking-widest text-sm">
              COVER
            </span>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Pakistan&apos;s premium technology store. Quality products
              delivered nationwide with cash on delivery.
            </p>
            <div className="flex items-center gap-4">
              <Globe
                size={18}
                className="text-on-surface-variant hover:text-white cursor-pointer transition-colors"
              />
              <Mail
                size={18}
                className="text-on-surface-variant hover:text-white cursor-pointer transition-colors"
              />
            </div>
          </div>

          {/* Column 2 - Products */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">
              Products
            </h4>
            <ul className="flex flex-col gap-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-on-surface-variant hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">
              Support
            </h4>
            <ul className="flex flex-col gap-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-on-surface-variant hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Stay Updated */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">
              Stay Updated
            </h4>
            <div className="flex items-center bg-surface-container-highest p-1 rounded-lg">
              <input
                type="email"
                placeholder="Your email"
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-white text-xs px-3 w-full placeholder:text-outline-variant"
              />
              <button
                type="button"
                className="bg-primary p-2 rounded-lg text-black flex-shrink-0"
                aria-label="Subscribe"
              >
                <Mail size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Payment Badges */}
        <div className="mt-12 flex items-center gap-4">
          <span className="text-on-surface-variant text-xs">We Accept:</span>
          {paymentMethods.map((method) => (
            <span
              key={method}
              className="bg-surface-container-highest text-on-surface-variant text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider"
            >
              {method}
            </span>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-on-surface-variant text-xs">
            &copy; 2025 Cover. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="text-on-surface-variant hover:text-white text-xs transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
