import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
  Row,
  Column,
  Button,
  Tailwind,
} from "@react-email/components";

interface OrderItem {
  name: string;
  variantLabel?: string | null;
  quantity: number;
  unitPricePkr: string;
  totalPkr: string;
}

export interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  subtotalPkr: string;
  shippingChargePkr: string;
  discountPkr: string;
  totalPkr: string;
  shippingAddress: {
    line1: string;
    city: string;
    province: string;
    postalCode?: string | null;
    phone: string;
  };
  storeUrl?: string;
}

const ADVANCE_AMOUNT = 250;
const ACCOUNT_TITLE = "Ahmed Bilal";
const EASYPAISA_NUMBER = "03154267454";
const BANK_NAME = "Meezan Bank";
const BANK_ACCOUNT = "51680020152431280016";
const BANK_IBAN = "PK42ABPA0020152431280016";
const WHATSAPP_DISPLAY = "03154267454";
const WHATSAPP_URL = "https://wa.me/923154267454";

function fmt(pkr: string | number): string {
  const n = typeof pkr === "number" ? pkr : parseFloat(pkr);
  return `Rs. ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

export function OrderConfirmationEmail({
  customerName,
  orderNumber,
  items,
  subtotalPkr,
  shippingChargePkr,
  discountPkr,
  totalPkr,
  shippingAddress,
  storeUrl = "https://refine.pk",
}: OrderConfirmationEmailProps) {
  const totalNum = parseFloat(totalPkr);
  const codRemaining = Math.max(0, totalNum - ADVANCE_AMOUNT);
  const whatsappMessage = encodeURIComponent(
    `Salam, order #${orderNumber} ke liye Rs. ${ADVANCE_AMOUNT} advance bhej diya hai. Screenshot attached.`,
  );

  return (
    <Html>
      <Head />
      <Preview>{`Order #${orderNumber} confirmed — Rs. ${ADVANCE_AMOUNT} advance required`}</Preview>
      <Tailwind>
        <Body className="bg-[#0e0e0e] font-sans">
          <Container className="mx-auto max-w-[600px] bg-[#1a1919] p-8">
            {/* Header */}
            <Section>
              <Text className="m-0 text-[11px] font-bold uppercase tracking-[0.3em] text-[#ff915c]">
                Refine
              </Text>
              <Heading className="mt-2 text-3xl font-black tracking-tight text-white">
                Shukriya, {customerName}!
              </Heading>
              <Text className="text-[#adaaaa]">
                Aap ka order place ho gaya hai.
              </Text>
            </Section>

            {/* Order number */}
            <Section className="mt-6 rounded-lg bg-[#0e0e0e] p-5 text-center">
              <Text className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-[#adaaaa]">
                Order Number
              </Text>
              <Text className="mt-1 text-2xl font-black tracking-tight text-[#ff915c]">
                {orderNumber}
              </Text>
            </Section>

            {/* Roman Urdu Advance Payment Block */}
            <Section className="mt-6 rounded-lg border border-[#ff915c]/30 bg-[#0e0e0e] p-6">
              {/* Warning band */}
              <Section className="mb-5 rounded-lg border border-[#ff915c]/40 bg-[#ff915c]/10 p-4">
                <Text className="m-0 text-sm font-bold leading-snug text-[#ff915c]">
                  ⚠ Rs. {ADVANCE_AMOUNT} advance bhejne tak order ship nahi hoga
                </Text>
              </Section>

              {/* Big amount card */}
              <Section className="mb-5 rounded-lg bg-[#1a1919] p-5 text-center">
                <Text className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-[#adaaaa]">
                  Advance Payment Required
                </Text>
                <Text className="mx-0 mt-2 mb-0 text-4xl font-black tracking-tight text-[#ff915c]">
                  RS {ADVANCE_AMOUNT}
                </Text>
                <Text className="mx-0 mt-3 mb-0 text-sm leading-relaxed text-[#adaaaa]">
                  Yeh amount total bill se minus kar di jayegi ✅
                </Text>
                {totalNum > 0 && (
                  <Text className="m-0 text-sm leading-relaxed text-[#adaaaa]">
                    Baaki <strong className="text-white">{fmt(codRemaining)}</strong> delivery ke time (COD) pay karna hoga
                  </Text>
                )}
              </Section>

              {/* Easypaisa / NayaPay */}
              <Section className="mb-3 rounded-lg border border-[#262626] bg-[#1a1919] p-4">
                <Text className="m-0 text-sm font-bold text-white">
                  📱 Easypaisa / NayaPay
                </Text>
                <Row className="mt-3">
                  <Column>
                    <Text className="m-0 text-[10px] uppercase tracking-[0.2em] text-[#adaaaa]">
                      Account Title
                    </Text>
                    <Text className="m-0 text-sm font-bold text-white">
                      {ACCOUNT_TITLE}
                    </Text>
                  </Column>
                  <Column>
                    <Text className="m-0 text-[10px] uppercase tracking-[0.2em] text-[#adaaaa]">
                      Number
                    </Text>
                    <Text className="m-0 text-sm font-bold text-white">
                      {EASYPAISA_NUMBER}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Meezan Bank */}
              <Section className="mb-5 rounded-lg border border-[#262626] bg-[#1a1919] p-4">
                <Text className="m-0 text-sm font-bold text-white">
                  🏦 {BANK_NAME}
                </Text>
                <Row className="mt-3">
                  <Column>
                    <Text className="m-0 text-[10px] uppercase tracking-[0.2em] text-[#adaaaa]">
                      Account Title
                    </Text>
                    <Text className="m-0 text-sm font-bold text-white">
                      {ACCOUNT_TITLE}
                    </Text>
                  </Column>
                  <Column>
                    <Text className="m-0 text-[10px] uppercase tracking-[0.2em] text-[#adaaaa]">
                      Account No
                    </Text>
                    <Text className="m-0 text-sm font-bold text-white">
                      {BANK_ACCOUNT}
                    </Text>
                  </Column>
                </Row>
                <Row className="mt-3">
                  <Column>
                    <Text className="m-0 text-[10px] uppercase tracking-[0.2em] text-[#adaaaa]">
                      IBAN
                    </Text>
                    <Text className="m-0 text-sm font-bold text-white">
                      {BANK_IBAN}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Screenshot directive */}
              <Text className="text-sm leading-relaxed text-[#adaaaa]">
                📸 Payment ke baad screenshot WhatsApp par send kar dein:{" "}
                <strong className="text-white">{WHATSAPP_DISPLAY}</strong>
              </Text>

              <Button
                href={`${WHATSAPP_URL}?text=${whatsappMessage}`}
                className="mt-2 block rounded-lg bg-[#25D366] px-6 py-3 text-center text-sm font-bold uppercase tracking-wider text-white"
              >
                WhatsApp Par Screenshot Bhejein
              </Button>
            </Section>

            {/* Items */}
            <Section className="mt-6">
              <Heading className="text-base font-bold text-white">
                Order Summary
              </Heading>
              {items.map((item, i) => (
                <Row key={i} className="mt-3">
                  <Column>
                    <Text className="m-0 text-sm font-bold text-white">
                      {item.name}
                    </Text>
                    {item.variantLabel && (
                      <Text className="m-0 text-xs text-[#adaaaa]">
                        {item.variantLabel} × {item.quantity}
                      </Text>
                    )}
                    {!item.variantLabel && (
                      <Text className="m-0 text-xs text-[#adaaaa]">
                        Qty {item.quantity}
                      </Text>
                    )}
                  </Column>
                  <Column align="right">
                    <Text className="m-0 text-sm font-bold text-white">
                      {fmt(item.totalPkr)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr className="my-6 border-[#262626]" />

            {/* Totals */}
            <Section>
              <Row>
                <Column>
                  <Text className="m-0 text-sm text-[#adaaaa]">Subtotal</Text>
                </Column>
                <Column align="right">
                  <Text className="m-0 text-sm text-white">
                    {fmt(subtotalPkr)}
                  </Text>
                </Column>
              </Row>
              <Row className="mt-2">
                <Column>
                  <Text className="m-0 text-sm text-[#adaaaa]">Shipping</Text>
                </Column>
                <Column align="right">
                  <Text className="m-0 text-sm text-white">
                    {parseFloat(shippingChargePkr) === 0
                      ? "Free"
                      : fmt(shippingChargePkr)}
                  </Text>
                </Column>
              </Row>
              {parseFloat(discountPkr) > 0 && (
                <Row className="mt-2">
                  <Column>
                    <Text className="m-0 text-sm text-[#adaaaa]">Discount</Text>
                  </Column>
                  <Column align="right">
                    <Text className="m-0 text-sm text-[#4ade80]">
                      -{fmt(discountPkr)}
                    </Text>
                  </Column>
                </Row>
              )}
              <Hr className="my-3 border-[#262626]" />
              <Row>
                <Column>
                  <Text className="m-0 text-base font-black text-white">
                    Total
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="m-0 text-base font-black text-white">
                    {fmt(totalPkr)}
                  </Text>
                </Column>
              </Row>
              <Row className="mt-3">
                <Column>
                  <Text className="m-0 text-xs font-bold uppercase tracking-[0.2em] text-[#ff915c]">
                    Advance (abhi)
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="m-0 text-sm font-bold text-[#ff915c]">
                    {fmt(ADVANCE_AMOUNT)}
                  </Text>
                </Column>
              </Row>
              <Row className="mt-2">
                <Column>
                  <Text className="m-0 text-xs font-bold uppercase tracking-[0.2em] text-[#adaaaa]">
                    COD (delivery par)
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="m-0 text-sm font-bold text-[#adaaaa]">
                    {fmt(codRemaining)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Shipping Address */}
            <Section className="mt-6 rounded-lg bg-[#0e0e0e] p-4">
              <Text className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-[#adaaaa]">
                Shipping To
              </Text>
              <Text className="m-0 mt-1 text-sm text-white">
                {customerName}
                <br />
                {shippingAddress.line1}
                <br />
                {shippingAddress.city}, {shippingAddress.province}
                {shippingAddress.postalCode && ` ${shippingAddress.postalCode}`}
                <br />
                {shippingAddress.phone}
              </Text>
            </Section>

            <Hr className="my-6 border-[#262626]" />

            {/* Footer */}
            <Section>
              <Text className="text-xs text-[#adaaaa]">
                Questions? Reply to this email or message us on WhatsApp at{" "}
                {WHATSAPP_DISPLAY}.
              </Text>
              <Text className="text-xs text-[#adaaaa]">
                <Link href={storeUrl} className="text-[#ff915c] no-underline">
                  refine.pk
                </Link>
                {" · "}
                <Link
                  href={`${storeUrl}/account/orders`}
                  className="text-[#ff915c] no-underline"
                >
                  Track Order
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default OrderConfirmationEmail;
