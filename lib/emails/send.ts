import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  addresses,
  productVariants,
  products,
  users,
} from "@/lib/db/schema";
import {
  OrderConfirmationEmail,
  type OrderConfirmationEmailProps,
} from "./order-confirmation";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

const resend = RESEND_API_KEY && EMAIL_FROM ? new Resend(RESEND_API_KEY) : null;

/**
 * Send order confirmation email. Fire-and-forget — caller should NOT await
 * so a Resend outage or network hiccup doesn't block checkout.
 *
 * Fetches everything it needs from the DB by orderNumber, so the caller
 * only needs to pass the order number after the transaction commits.
 */
export async function sendOrderConfirmation(orderNumber: string): Promise<void> {
  if (!resend || !EMAIL_FROM) {
    const missing = [
      !RESEND_API_KEY && "RESEND_API_KEY",
      !EMAIL_FROM && "EMAIL_FROM",
    ]
      .filter(Boolean)
      .join(" and ");
    console.warn(`[email] ${missing} not set — skipping order confirmation`);
    return;
  }

  try {
    // Fetch the order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);
    if (!order) {
      console.error(`[email] order ${orderNumber} not found`);
      return;
    }

    // Resolve customer email — logged-in user OR guestEmail
    let customerEmail: string | null = null;
    let customerFirstName: string | null = null;
    if (order.userId) {
      const [u] = await db
        .select({ email: users.email, firstName: users.firstName })
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1);
      customerEmail = u?.email ?? null;
      customerFirstName = u?.firstName ?? null;
    } else {
      customerEmail = order.guestEmail;
    }

    if (!customerEmail) {
      console.warn(`[email] no email for order ${orderNumber} — skipping`);
      return;
    }

    // Fetch address
    const [address] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, order.addressId))
      .limit(1);
    if (!address) {
      console.error(`[email] address missing for order ${orderNumber}`);
      return;
    }

    // Fetch items with product names + variant attrs
    const rawItems = await db
      .select({
        quantity: orderItems.quantity,
        unitPricePkr: orderItems.unitPricePkr,
        totalPkr: orderItems.totalPkr,
        color: productVariants.color,
        size: productVariants.size,
        productName: products.nameEn,
      })
      .from(orderItems)
      .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
      .leftJoin(products, eq(products.id, productVariants.productId))
      .where(eq(orderItems.orderId, order.id));

    const items: OrderConfirmationEmailProps["items"] = rawItems.map((r) => {
      const parts = [r.color, r.size].filter(Boolean);
      return {
        name: r.productName ?? "Product",
        variantLabel: parts.length > 0 ? parts.join(" / ") : null,
        quantity: r.quantity,
        unitPricePkr: r.unitPricePkr,
        totalPkr: r.totalPkr,
      };
    });

    const firstName = customerFirstName ?? address.firstName ?? "Customer";

    await resend.emails.send({
      from: EMAIL_FROM,
      to: customerEmail,
      subject: `Order #${order.orderNumber} confirmed — complete payment to ship`,
      react: OrderConfirmationEmail({
        customerName: firstName,
        orderNumber: order.orderNumber,
        items,
        subtotalPkr: order.subtotalPkr,
        shippingChargePkr: order.shippingChargePkr,
        discountPkr: order.discountPkr,
        totalPkr: order.totalPkr,
        shippingAddress: {
          line1: address.addressLine1,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          phone: address.phonePk ?? "",
        },
      }),
    });
  } catch (err) {
    console.error(`[email] failed to send order confirmation for ${orderNumber}:`, err);
  }
}
