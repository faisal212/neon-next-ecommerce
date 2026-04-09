"use client";

import { Breadcrumbs } from "@/components/store/breadcrumbs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqCategories = [
  {
    title: "Orders",
    questions: [
      {
        q: "How do I place an order?",
        a: "Browse our products, add items to your cart, and proceed to checkout. You can pay via card, bank transfer, JazzCash, EasyPaisa, or cash on delivery. You will receive an order confirmation via email and SMS.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "You can modify or cancel your order within 1 hour of placement by contacting our support team at support@cover.pk or calling +92 (42) 111-COVER. Once an order has been dispatched, it cannot be cancelled.",
      },
      {
        q: "How can I track my order?",
        a: "After your order is dispatched, you will receive a tracking number via SMS and email. Use this number on our website or the courier's portal to track your delivery in real-time.",
      },
      {
        q: "What if I receive a damaged or wrong product?",
        a: "Contact us immediately within 24 hours of delivery with photos of the damaged or incorrect item. We will arrange a free replacement or full refund at no additional cost to you.",
      },
    ],
  },
  {
    title: "Shipping",
    questions: [
      {
        q: "What are the delivery timelines?",
        a: "Express delivery takes 2-3 business days for Lahore, Karachi, and Islamabad. Standard delivery takes 3-5 business days for all other cities and towns across Pakistan.",
      },
      {
        q: "Is free shipping available?",
        a: "Yes! We offer free shipping on all orders above Rs. 5,000. This applies to both Express and Standard shipping across Pakistan.",
      },
      {
        q: "Do you deliver to all cities in Pakistan?",
        a: "We deliver to all major cities and most towns across Pakistan. If you are unsure about delivery to your area, please contact us and we will confirm availability.",
      },
    ],
  },
  {
    title: "Returns",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day return policy from the date of delivery. Items must be unused, in original packaging, and in the same condition as received. Some items like earphones and personal care products may not be eligible for return due to hygiene reasons.",
      },
      {
        q: "How do I initiate a return?",
        a: "Contact our support team via email at support@cover.pk or call +92 (42) 111-COVER with your order number. We will guide you through the return process and arrange a pickup if applicable.",
      },
      {
        q: "How long does it take to receive a refund?",
        a: "Once we receive and inspect the returned item, refunds are processed within 5-7 business days. Bank transfers may take an additional 2-3 business days to reflect in your account.",
      },
      {
        q: "Can I exchange a product instead of returning it?",
        a: "Yes, exchanges are available for the same product in a different variant (e.g., colour or size) subject to stock availability. Contact our support team to arrange an exchange.",
      },
    ],
  },
  {
    title: "Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Visa and Mastercard credit/debit cards, bank transfers, JazzCash, EasyPaisa, and Cash on Delivery (COD). All online payments are processed securely with SSL encryption.",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes, COD is available for deliveries across Pakistan. A nominal COD fee of Rs. 50 applies. Payment is collected in cash at the time of delivery.",
      },
      {
        q: "Are my payment details secure?",
        a: "Absolutely. We use industry-standard SSL encryption and never store your card details on our servers. All transactions are processed through certified payment gateways.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

      <div className="mt-16 max-w-3xl">
        <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Help Centre
        </span>
        <h1 className="text-5xl font-black tracking-tight md:text-6xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
          Find answers to common questions about ordering, shipping, returns, and
          payments. Can&apos;t find what you&apos;re looking for? Contact us at{" "}
          <span className="text-primary">support@cover.pk</span>.
        </p>
      </div>

      <div className="mt-16 max-w-3xl space-y-12">
        {faqCategories.map((category) => (
          <div key={category.title}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
              {category.title}
            </h2>

            <div className="rounded-lg bg-surface-container p-6">
              <Accordion>
                {category.questions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    className="border-surface-container-highest"
                  >
                    <AccordionTrigger className="py-4 text-base font-bold hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-on-surface-variant leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
