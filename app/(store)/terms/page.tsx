import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Breadcrumbs } from "@/components/store/breadcrumbs";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read Refine's terms and conditions. Understand your rights and responsibilities when using our platform and purchasing products.",
};

export default async function TermsPage() {
  "use cache";
  cacheLife("max");
  cacheTag("static-terms");

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Terms" }]}
      />

      <div className="mt-16 max-w-3xl">
        <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Legal
        </span>
        <h1 className="text-5xl font-black tracking-tight md:text-6xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 text-sm text-on-surface-variant">
          Last updated: April 1, 2026
        </p>
      </div>

      <div className="mt-16 max-w-3xl space-y-12">
        {/* Section 1 */}
        <div>
          <h2 className="text-2xl font-black">1. Acceptance of Terms</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              By accessing and using the Refine website and services, you agree to
              be bound by these Terms and Conditions. If you do not agree to
              these terms, please do not use our platform.
            </p>
            <p>
              These terms apply to all visitors, users, and customers of
              Refine. We reserve the right to update these terms at any time, and
              continued use of the platform constitutes acceptance of any
              changes.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-surface-container-low p-8">
          <h2 className="text-2xl font-black">2. Account Registration</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              To place orders on Refine, you may be required to create an
              account. You are responsible for maintaining the confidentiality of
              your account credentials and for all activities that occur under
              your account.
            </p>
            <p>
              You must provide accurate, current, and complete information during
              the registration process. You agree to notify us immediately of any
              unauthorised access to your account.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div>
          <h2 className="text-2xl font-black">3. Products and Pricing</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              All product prices are listed in Pakistani Rupees (PKR) and are
              inclusive of applicable taxes unless otherwise stated. Prices are
              subject to change without prior notice.
            </p>
            <p>
              We make every effort to accurately display product descriptions,
              images, and specifications. However, we do not guarantee that
              product listings are error-free. In the event of a pricing error,
              we reserve the right to cancel the order and issue a full refund.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-surface-container-low p-8">
          <h2 className="text-2xl font-black">4. Orders and Payment</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              When you place an order on Refine, it constitutes an offer to
              purchase. We reserve the right to accept or decline any order at
              our discretion.
            </p>
            <p>We accept the following payment methods:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Cash on Delivery (COD)</li>
              <li>Credit / Debit Cards (Visa, Mastercard)</li>
              <li>Bank Transfer</li>
              <li>JazzCash and EasyPaisa</li>
            </ul>
            <p>
              Orders are processed once payment is confirmed. For COD orders,
              payment is collected upon delivery.
            </p>
          </div>
        </div>

        {/* Section 5 */}
        <div>
          <h2 className="text-2xl font-black">5. Shipping and Delivery</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              We deliver to all major cities and towns across Pakistan. Delivery
              times are estimated and may vary depending on your location and
              product availability. Please refer to our{" "}
              <span className="text-primary">Shipping Information</span> page
              for detailed delivery timelines and charges.
            </p>
          </div>
        </div>

        {/* Section 6 */}
        <div>
          <h2 className="text-2xl font-black">6. Returns and Refunds</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              We offer a 7-day return policy on eligible products. Items must be
              returned in their original condition and packaging. Please see our{" "}
              <span className="text-primary">Returns Policy</span> page for
              complete details on the return process, eligibility, and refund
              timelines.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-surface-container-low p-8">
          <h2 className="text-2xl font-black">7. Intellectual Property</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              All content on the Refine platform — including logos, text, images,
              graphics, and software — is the property of Refine or its licensors
              and is protected by applicable intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, or create derivative
              works from any content on our platform without prior written
              consent.
            </p>
          </div>
        </div>

        {/* Section 8 */}
        <div>
          <h2 className="text-2xl font-black">8. Limitation of Liability</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              Refine shall not be liable for any indirect, incidental, special,
              or consequential damages arising from your use of our platform or
              products purchased through it. Our total liability for any claim
              shall not exceed the amount paid by you for the specific product
              giving rise to the claim.
            </p>
          </div>
        </div>

        {/* Section 9 */}
        <div>
          <h2 className="text-2xl font-black">9. Governing Law</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              These Terms and Conditions are governed by and construed in
              accordance with the laws of Pakistan. Any disputes arising from
              these terms shall be subject to the exclusive jurisdiction of the
              courts of Lahore, Punjab.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-surface-container-low p-8">
          <h2 className="text-2xl font-black">10. Contact Us</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              If you have any questions about these Terms and Conditions, please
              reach out to us:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Email:{" "}
                <span className="text-primary">contact@refine.pk</span>
              </li>
              <li>Phone: +92 (42) 111-REFINE</li>
              <li>Address: Lahore, Punjab, Pakistan</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
