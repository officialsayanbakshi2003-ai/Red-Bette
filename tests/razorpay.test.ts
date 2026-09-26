import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isDemoPaymentsEnabled, verifyPaymentSignature, verifyWebhookSignature } from "@/lib/payments/razorpay";

const secret = "test_secret_123";

describe("verifyPaymentSignature", () => {
  const sign = (o: string, p: string) => createHmac("sha256", secret).update(`${o}|${p}`).digest("hex");

  it("accepts a genuine signature", () => {
    expect(
      verifyPaymentSignature({ razorpayOrderId: "order_1", razorpayPaymentId: "pay_1", signature: sign("order_1", "pay_1"), secret }),
    ).toBe(true);
  });

  it("rejects a signature for a different payment or order", () => {
    const sig = sign("order_1", "pay_1");
    expect(verifyPaymentSignature({ razorpayOrderId: "order_1", razorpayPaymentId: "pay_2", signature: sig, secret })).toBe(false);
    expect(verifyPaymentSignature({ razorpayOrderId: "order_2", razorpayPaymentId: "pay_1", signature: sig, secret })).toBe(false);
  });

  it("rejects malformed signatures without throwing", () => {
    expect(verifyPaymentSignature({ razorpayOrderId: "o", razorpayPaymentId: "p", signature: "abc", secret })).toBe(false);
    expect(verifyPaymentSignature({ razorpayOrderId: "o", razorpayPaymentId: "p", signature: "", secret })).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  it("validates the raw body", () => {
    const body = JSON.stringify({ event: "payment.captured" });
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
    expect(verifyWebhookSignature(body + " ", sig, secret)).toBe(false);
  });
});

describe("demo payments", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("are never enabled in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOW_DEMO_PAYMENTS", "true");
    vi.stubEnv("RAZORPAY_KEY_ID", "");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "");
    expect(isDemoPaymentsEnabled()).toBe(false);
  });

  it("are disabled when real keys exist", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ALLOW_DEMO_PAYMENTS", "true");
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_x");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "secret");
    expect(isDemoPaymentsEnabled()).toBe(false);
  });
});
