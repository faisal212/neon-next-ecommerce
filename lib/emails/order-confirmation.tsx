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

const EASYPAY_NUMBER = "0315 4267454";
const EASYPAY_NAME = "Ahmed Bilal";
const WHATSAPP_URL = "https://wa.me/923154267454";

function fmt(pkr: string): string {
  const n = parseFloat(pkr);
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
  const hasShipping = parseFloat(shippingChargePkr) > 0;
  const whatsappMessage = encodeURIComponent(
    `Hi, I've sent Rs. ${shippingChargePkr} shipping fee for order #${orderNumber} via EasyPaisa. Here's the screenshot:`,
  );

  return (
    <Html>
      <Head />
      <Preview>
        Order #{orderNumber} confirmed — complete payment to ship
      </Preview>
      <Tailwind>
        <Body className="bg-[#0e0e0e] font-sans">
          <Container className="mx-auto max-w-[600px] bg-[#1a1919] p-8">
            {/* Header */}
            <Section>
              <Text className="m-0 text-[11px] font-bold uppercase tracking-[0.3em] text-[#ff915c]">
                Refine
              </Text>
              <Heading className="mt-2 text-3xl font-black tracking-tight text-white">
                Thank you, {customerName}!
              </Heading>
              <Text className="text-[#adaaaa]">
                Your order has been placed successfully.
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

            {/* EasyPaisa Payment Instructions */}
            {hasShipping && (
              <Section className="mt-6 rounded-lg border border-[#ff915c]/20 bg-[#0e0e0e] p-6">
                <Heading className="m-0 text-lg font-black text-white">
                  Complete Your Order
                </Heading>
                <Text className="text-sm text-[#adaaaa]">
                  Send the shipping fee to confirm your order:
                </Text>

                <Section className="mt-4 rounded bg-[#1a1919] p-4">
                  <Row>
                    <Column>
                      <Text className="m-0 text-xs text-[#adaaaa]">
                        Send via EasyPaisa
                      </Text>
                      <Text className="m-0 mt-1 text-xl font-black text-white">
                        {fmt(shippingChargePkr)}
                      </Text>
                    </Column>
                  </Row>
                  <Row className="mt-3">
                    <Column>
                      <Text className="m-0 text-xs text-[#adaaaa]">
                        EasyPaisa Number
                      </Text>
                      <Text className="m-0 text-base font-bold text-white">
                        {EASYPAY_NUMBER}
                      </Text>
                    </Column>
                    <Column>
                      <Text className="m-0 text-xs text-[#adaaaa]">
                        Account Name
                      </Text>
                      <Text className="m-0 text-base font-bold text-white">
                        {EASYPAY_NAME}
                      </Text>
                    </Column>
                  </Row>
                </Section>

                <Text className="mt-4 text-sm text-[#adaaaa]">
                  After payment, send the screenshot to the same number on
                  WhatsApp. Your order ships within 24 hours of verification.
                </Text>

                <Button
                  href={`${WHATSAPP_URL}?text=${whatsappMessage}`}
                  className="mt-4 block rounded-lg bg-[#25D366] px-6 py-3 text-center text-sm font-bold uppercase tracking-wider text-white"
                >
                  Send Screenshot on WhatsApp
                </Button>
              </Section>
            )}

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
                    Total (Cash on Delivery)
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="m-0 text-base font-black text-white">
                    {fmt(totalPkr)}
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
                {EASYPAY_NUMBER}.
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
