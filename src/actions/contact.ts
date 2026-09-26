"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { limitByIp } from "@/lib/rate-limit";
import { contactSchema, emailSchema, fieldErrors } from "@/lib/validators";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> };

export async function subscribeNewsletter(_prev: FormState, formData: FormData): Promise<FormState> {
  const limited = await limitByIp("newsletter", 8, 10 * 60_000);
  if (!limited.success) return { ok: false, message: "Too many attempts. Please try again later." };

  const parsed = z.object({ email: emailSchema }).safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Enter a valid email address." };

  await db.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  });
  // Same response whether or not the email was already subscribed.
  return { ok: true, message: "You're in. Watch your inbox for the next drop." };
}

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const limited = await limitByIp("contact", 5, 10 * 60_000);
  if (!limited.success) return { ok: false, message: "Too many messages. Please try again later." };

  // Honeypot field: real people never fill it in.
  if (formData.get("company")) return { ok: true, message: "Thanks! We'll get back to you within 24 hours." };

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  await db.contactMessage.create({ data: parsed.data });
  return { ok: true, message: "Thanks! We'll get back to you within 24 hours." };
}
