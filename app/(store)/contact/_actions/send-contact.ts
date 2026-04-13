"use server";

import { z } from "zod";
import { sendContactNotification } from "@/lib/emails/send";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Invalid email address").max(200),
  subject: z.string().trim().min(3, "Subject is too short").max(200),
  message: z.string().trim().min(10, "Message is too short").max(5000),
});

export type ContactActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; error: string };

export async function sendContact(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const parsed = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { status: "error", error: first?.message ?? "Invalid input" };
  }

  const result = await sendContactNotification(parsed.data);
  if (!result.ok) {
    return { status: "error", error: result.error ?? "Send failed" };
  }

  return { status: "success" };
}
