import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Breadcrumbs } from "@/components/store/breadcrumbs";

export const metadata: Metadata = {
  title: "Returns Policy",
  description:
    "Refine's returns and refund policy. Learn about our 7-day return window, eligibility conditions, and step-by-step return process.",
};

const steps = [
  {
    number: "01",
    title: "Contact Support",
    description:
      "Reach out to our support team via email at contact@refine.pk or call +92 (42) 111-REFINE. Provide your order number and reason for return.",
  },
  {
    number: "02",
    title: "Get Approval",
    description:
      "Our team will review your request within 24 hours and issue a return authorisation if the item meets our return eligibility criteria.",
  },
  {
    number: "03",
    title: "Ship the Item",
    description:
      "Pack the item securely in its original packaging with all accessories and tags. We will arrange a free pickup or provide a prepaid shipping label.",
  },
  {
    number: "04",
    title: "Receive Refund",
    description:
      "Once we receive and inspect the returned item, your refund will be processed within 5-7 business days to your original payment method.",
  },
];

export default async function ReturnsPolicyPage() {
  "use cache";
  cacheLife("max");
  cacheTag("static-returns-policy");

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Returns Policy" }]}
      />

      <div className="mt-16 max-w-3xl">
        <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Policy
        </span>
        <h1 className="text-5xl font-black tracking-tight md:text-6xl">
          Returns Policy
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
          We want you to be completely satisfied with every purchase. If
          something isn&apos;t right, our straightforward return process makes it
          easy to get a replacement or refund.
        </p>
      </div>

      {/* Return Window */}
      <div className="mt-16 max-w-3xl">
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-8">
          <h2 className="text-2xl font-black">
            <span className="text-primary">7-Day</span> Return Window
          </h2>
          <p className="mt-3 leading-relaxed text-on-surface-variant">
            You have 7 days from the date of delivery to initiate a return. Items
            returned after this window will not be eligible for a refund or
            exchange.
          </p>
        </div>
      </div>

      {/* Conditions */}
      <div className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-black">Eligibility Conditions</h2>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-surface-container p-6">
            <h3 className="font-bold text-on-surface">Eligible for Return</h3>
            <ul className="mt-3 ml-6 list-disc space-y-2 text-on-surface-variant">
              <li>Item is unused and in its original condition</li>
              <li>Original packaging, tags, and accessories are intact</li>
              <li>Return is initiated within 7 days of delivery</li>
              <li>Item has a manufacturing defect or was damaged in transit</li>
              <li>Wrong item was delivered</li>
            </ul>
          </div>

          <div className="rounded-lg bg-surface-container-low p-6">
            <h3 className="font-bold text-on-surface">
              Not Eligible for Return
            </h3>
            <ul className="mt-3 ml-6 list-disc space-y-2 text-on-surface-variant">
              <li>Items that have been used, opened, or altered</li>
              <li>Earphones, headphones, and personal care items (hygiene policy)</li>
              <li>Software, digital products, and gift cards</li>
              <li>Items purchased during clearance or flash sales (final sale)</li>
              <li>Items without original packaging or missing accessories</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Return Process Steps */}
      <div className="mt-16 max-w-3xl">
        <h2 className="mb-8 text-2xl font-black">How to Return</h2>

        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex items-start gap-6 rounded-lg bg-surface-container p-6"
            >
              <span className="shrink-0 text-3xl font-black text-primary">
                {step.number}
              </span>
              <div>
                <h3 className="text-lg font-black">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-on-surface-variant">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refund Timeline */}
      <div className="mt-16 max-w-3xl">
        <h2 className="text-2xl font-black">Refund Timeline</h2>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-surface-container-low p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                  Inspection
                </p>
                <p className="mt-2 text-lg font-black">1-2 Days</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  After receiving the item
                </p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                  Processing
                </p>
                <p className="mt-2 text-lg font-black">5-7 Days</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Refund initiated to payment method
                </p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                  Bank Transfer
                </p>
                <p className="mt-2 text-lg font-black">2-3 Days</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Additional time for bank processing
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-on-surface-variant">
          COD refunds are processed via bank transfer. Please provide your bank
          account details when initiating the return. For questions about your
          refund status, contact{" "}
          <span className="text-primary">contact@refine.pk</span>.
        </p>
      </div>
    </section>
  );
}
