import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isSameOrigin, jsonError, readJson } from "@/lib/http";
import { markOrderPaid } from "@/lib/orders";
import { razorpayKeys, verifyPaymentSignature } from "@/lib/payments/razorpay";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { razorpayVerifySchema } from "@/lib/validators";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Forbidden", 403);
  const limited = rateLimit(`verify:${clientIpFrom(request.headers)}`, 30, 10 * 60_000);
  if (!limited.success) return jsonError("Too many requests.", 429);

  const keys = razorpayKeys();
  if (!keys) return jsonError("Online payments are not configured.", 503);

  let body;
  try {
    body = razorpayVerifySchema.parse(await readJson(request));
  } catch {
    return jsonError("Invalid request.", 400);
  }

  const order = await db.order.findUnique({
    where: { id: body.orderId },
    select: { id: true, razorpayOrderId: true, accessToken: true },
  });
  if (!order || !order.razorpayOrderId || order.razorpayOrderId !== body.razorpay_order_id) {
    return jsonError("Order not found.", 404);
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: body.razorpay_payment_id,
    signature: body.razorpay_signature,
    secret: keys.keySecret,
  });
  if (!valid) return jsonError("Payment verification failed.", 400);

  const result = await markOrderPaid({ where: { id: order.id }, paymentId: body.razorpay_payment_id });
  if (!result.ok) return jsonError("We could not confirm this payment. Our team will review it.", 409);

  return NextResponse.json({ ok: true, redirect: `/orders/${order.id}?token=${order.accessToken}` });
}
