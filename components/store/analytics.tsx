import Script from "next/script";

const GA_ID = "G-TPSL4MY70T";

export function GoogleAnalytics() {
  if (process.env.VERCEL_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// ─── E-commerce event helpers ──────────────────────────────────────────
// Call these from client components. They no-op if gtag isn't loaded
// (dev mode, ad blockers, etc.)

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...(args as Parameters<typeof window.gtag>));
  }
}

export function trackViewItem(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  gtag("event", "view_item", {
    currency: "PKR",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      },
    ],
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}) {
  gtag("event", "add_to_cart", {
    currency: "PKR",
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: product.quantity,
      },
    ],
  });
}

export function trackBeginCheckout(value: number, itemCount: number) {
  gtag("event", "begin_checkout", {
    currency: "PKR",
    value,
    items: [{ item_id: "cart", quantity: itemCount }],
  });
}

export function trackPurchase(order: {
  orderNumber: string;
  total: number;
  shipping: number;
}) {
  gtag("event", "purchase", {
    transaction_id: order.orderNumber,
    currency: "PKR",
    value: order.total,
    shipping: order.shipping,
  });
}

export function trackWhatsAppClick(orderNumber: string) {
  gtag("event", "whatsapp_click", {
    order_number: orderNumber,
    event_category: "engagement",
  });
}
