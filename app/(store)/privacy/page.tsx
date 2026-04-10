import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Breadcrumbs } from "@/components/store/breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Cover's privacy policy. Learn how we collect, use, and protect your personal information when you shop with us.",
};

export default async function PrivacyPage() {
  "use cache";
  cacheLife("max");
  cacheTag("static-privacy");

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />

      <div className="mt-16 max-w-3xl">
        <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Legal
        </span>
        <h1 className="text-5xl font-black tracking-tight md:text-6xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-on-surface-variant">
          Last updated: April 1, 2026
        </p>
      </div>

      <div className="mt-16 max-w-3xl space-y-12">
        {/* Section 1 */}
        <div>
          <h2 className="text-2xl font-black">1. Information We Collect</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              When you use Cover, we collect information that you provide
              directly, including your name, email address, phone number,
              shipping address, and payment details when placing an order.
            </p>
            <p>
              We also automatically collect certain technical information such as
              your IP address, browser type, device information, and browsing
              activity on our platform to improve our services.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-surface-container-low p-8">
          <h2 className="text-2xl font-black">2. How We Use Your Information</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>We use your personal information to:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Process and fulfil your orders</li>
              <li>Communicate about order status and delivery updates</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send promotional offers and newsletters (with your consent)</li>
              <li>Improve our website, products, and services</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div>
          <h2 className="text-2xl font-black">3. Information Sharing</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              We do not sell your personal information to third parties. We may
              share your information with trusted service providers who assist us
              in operating our platform, including:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Payment processors for secure transaction handling</li>
              <li>Courier and logistics partners for order delivery</li>
              <li>Analytics providers to improve our services</li>
            </ul>
            <p>
              All third-party service providers are contractually obligated to
              protect your data and use it only for the purposes we specify.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-surface-container-low p-8">
          <h2 className="text-2xl font-black">4. Data Security</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              We implement industry-standard security measures to protect your
              personal information, including SSL encryption for all data
              transmissions, secure payment processing, and regular security
              audits.
            </p>
            <p>
              While we strive to protect your information, no method of
              transmission over the Internet is 100% secure. We encourage you to
              use strong passwords and keep your account credentials
              confidential.
            </p>
          </div>
        </div>

        {/* Section 5 */}
        <div>
          <h2 className="text-2xl font-black">5. Cookies</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              We use cookies and similar tracking technologies to enhance your
              browsing experience, remember your preferences, and analyse site
              traffic. You can control cookie settings through your browser
              preferences.
            </p>
          </div>
        </div>

        {/* Section 6 */}
        <div>
          <h2 className="text-2xl font-black">6. Your Rights</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>You have the right to:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Access and review the personal data we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{" "}
              <span className="text-primary">support@cover.pk</span>.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-surface-container-low p-8">
          <h2 className="text-2xl font-black">7. Changes to This Policy</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              We may update this privacy policy from time to time to reflect
              changes in our practices or legal requirements. We will notify you
              of any significant changes by posting the updated policy on our
              website and updating the &quot;Last updated&quot; date.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-2xl font-black">8. Contact Us</h2>
          <div className="mt-4 space-y-3 leading-relaxed text-on-surface-variant">
            <p>
              If you have any questions or concerns about this Privacy Policy,
              please contact us:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Email:{" "}
                <span className="text-primary">support@cover.pk</span>
              </li>
              <li>Phone: +92 (42) 111-COVER</li>
              <li>Address: Lahore, Punjab, Pakistan</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
