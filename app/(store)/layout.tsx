import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cacheLife, cacheTag } from "next/cache";
import "./globals.css";
import { StoreHeader } from "@/components/store/header/store-header";
import { StoreFooter } from "@/components/store/footer/store-footer";
import { CartProvider } from "@/lib/store/cart-context";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/store/cart/cart-drawer";
import { GoogleAnalytics } from "@/components/store/analytics";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://refine.pk");

const SITE_TITLE = "Refine — Watches & Tech Accessories in Pakistan";
const SITE_DESCRIPTION =
  "Premium watches, tech accessories, and lifestyle essentials. Shipped across Pakistan with cash on delivery.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Refine",
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Refine",
    locale: "en_PK",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/default.webp", width: 750, height: 750, alt: "Refine" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/default.webp"],
  },
};

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // StoreHeader is cached here as part of the layout; edits to the header
  // component itself only land after the store-layout cache tag is
  // revalidated or Turbopack picks up the change.
  "use cache";
  cacheLife("weeks");
  cacheTag("store-layout");

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-sans selection:bg-primary selection:text-on-primary-fixed">
        <CartProvider>
          <StoreHeader />
          <main className="flex-1">{children}</main>
          <StoreFooter />
          <CartDrawer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1919',
                border: '1px solid #262626',
                color: '#ffffff',
              },
            }}
          />
        </CartProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
