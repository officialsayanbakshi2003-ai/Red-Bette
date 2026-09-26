"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { limitByIp } from "@/lib/rate-limit";
import { emailSchema } from "@/lib/validators";
import type { FormState } from "./contact";

const schema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^RB\d{6}-[A-Z0-9]{6}$/, "Order numbers look like RB260926-ABC123."),
  email: emailSchema,
});

export async function trackOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const limited = await limitByIp("track", 10, 10 * 60_000);
  if (!limited.success) return { ok: false, message: "Too many attempts. Please try again in a few minutes." };

  const parsed = schema.safeParse({ orderNumber: formData.get("orderNumber"), email: formData.get("email") });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, errors };
  }

  const order = await db.order.findUnique({
    where: { orderNumber: parsed.data.orderNumber },
    select: { id: true, email: true, accessToken: true },
  });
  // Same message whether the order or the email is wrong, so order numbers can't be probed.
  if (!order || order.email.toLowerCase() !== parsed.data.email) {
    return { ok: false, message: "We couldn't find an order with those details. Check the order number and email." };
  }
  redirect(`/orders/${order.id}?token=${encodeURIComponent(order.accessToken)}`);
}
