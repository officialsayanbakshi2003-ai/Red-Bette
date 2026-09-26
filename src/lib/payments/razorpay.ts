import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const RAZORPAY_API = "https://api.razorpay.com/v1";

export function razorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

export function isRazorpayConfigured(): boolean {
  return razorpayKeys() !== null;
}

/**
 * Demo payments let the full checkout be tried locally without Razorpay keys.
 * They are never available in production builds, whatever the env says.
 */
export function isDemoPaymentsEnabled(): boolean {
  return (
    !isRazorpayConfigured() &&
    process.env.NODE_ENV !== "production" &&
    process.env.ALLOW_DEMO_PAYMENTS === "true"
  );
}

export function isOnlinePaymentAvailable(): boolean {
  return isRazorpayConfigured() || isDemoPaymentsEnabled();
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export async function createRazorpayOrder(input: {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const keys = razorpayKeys();
  if (!keys) throw new Error("Razorpay is not configured");
  const auth = Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString("base64");
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: input.amount,
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes ?? {},
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return (await res.json()) as RazorpayOrder;
}

function safeEqualHex(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Verifies the signature Razorpay Checkout returns after a successful payment. */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
  secret: string;
}): boolean {
  const expected = createHmac("sha256", params.secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");
  return safeEqualHex(expected, params.signature);
}

/** Verifies the X-Razorpay-Signature header of a webhook against the raw request body. */
export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
