import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isSameOrigin, jsonError, readJson } from "@/lib/http";
import { markOrderPaid, tokensMatch } from "@/lib/orders";
import { isDemoPaymentsEnabled } from "@/lib/payments/razorpay";

// Development-only stand-in for Razorpay so checkout can be tested end to end
// without payment keys. Disabled in production builds.

const schema = z.object({ orderId: z.string().min(1).max(64), accessToken: z.string().min(1).max(64) });

export async function POST(request: Request) {
  if (!isDemoPaymentsEnabled()) return jsonError("Not found", 404);
  if (!isSameOrigin(request)) return jsonError("Forbidden", 403);

  let body;
  try {
    body = schema.parse(await readJson(request));
  } catch {
    return jsonError("Invalid request.", 400);
  }
  const order = await db.order.findUnique({ where: { id: body.orderId }, select: { id: true, accessToken: true } });
  if (!order || !tokensMatch(order.accessToken, body.accessToken)) return jsonError("Order not found.", 404);

  const result = await markOrderPaid({ where: { id: order.id }, paymentId: `demo_${randomBytes(8).toString("hex")}` });
  if (!result.ok) return jsonError(result.reason ?? "Payment failed.", 409);
  return NextResponse.json({ ok: true, redirect: `/orders/${order.id}?token=${order.accessToken}` });
}
