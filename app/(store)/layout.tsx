import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cacheLife, cacheTag } from "next/cache";
import "./globals.css";
import { StoreHeader } from "@/components/store/header/store-header";
import { StoreFooter } from "@/components/store/footer/store-footer";
import { CartProvider } from "@/lib/store/cart-context";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/store/cart/cart-drawer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Refine",
    default: "Refine — Watches & Tech Accessories in Pakistan",
  },
  description:
    "Premium watches, tech accessories, and lifestyle essentials. Shipped across Pakistan with cash on delivery.",
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
      </body>
    </html>
  );
}
