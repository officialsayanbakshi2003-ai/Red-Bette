import { describe, expect, it } from "vitest";
import { commerce } from "@/lib/config";
import { checkCoupon, computeDiscount, computeShipping, computeTotals, isCodAllowed, type CouponRule } from "@/lib/pricing";

const percent10: CouponRule = { code: "WELCOME10", type: "PERCENT", value: 10, minSubtotal: 999_00, maxDiscount: 500_00 };
const flat200: CouponRule = { code: "FLOW200", type: "FIXED", value: 200_00, minSubtotal: 1999_00 };

describe("computeDiscount", () => {
  it("applies a percentage and rounds down to whole rupees", () => {
    expect(computeDiscount(percent10, 2499_00)).toBe(249_00);
  });
  it("caps percentage discounts at maxDiscount", () => {
    expect(computeDiscount(percent10, 9999_00)).toBe(500_00);
  });
  it("never discounts more than the subtotal", () => {
    expect(computeDiscount({ ...flat200, value: 5000_00 }, 1000_00)).toBe(1000_00);
  });
  it("returns 0 without a coupon", () => {
    expect(computeDiscount(null, 2000_00)).toBe(0);
  });
});

describe("checkCoupon", () => {
  const now = new Date("2026-09-26T10:00:00Z");
  it("accepts a valid coupon", () => {
    expect(checkCoupon(percent10, 1500_00, now)).toEqual({ ok: true });
  });
  it("rejects when below the minimum", () => {
    const r = checkCoupon(flat200, 1500_00, now);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain("₹499");
  });
  it("rejects expired, inactive, not-started and used-up coupons", () => {
    expect(checkCoupon({ ...percent10, expiresAt: new Date("2026-09-01") }, 5000_00, now).ok).toBe(false);
    expect(checkCoupon({ ...percent10, isActive: false }, 5000_00, now).ok).toBe(false);
    expect(checkCoupon({ ...percent10, startsAt: new Date("2026-10-01") }, 5000_00, now).ok).toBe(false);
    expect(checkCoupon({ ...percent10, maxUses: 5, usedCount: 5 }, 5000_00, now).ok).toBe(false);
  });
});

describe("shipping and totals", () => {
  it("charges shipping below the free threshold and none above it", () => {
    expect(computeShipping(commerce.freeShippingThreshold - 1)).toBe(commerce.shippingFee);
    expect(computeShipping(commerce.freeShippingThreshold)).toBe(0);
    expect(computeShipping(0)).toBe(0);
  });

  it("computes an online order with coupon", () => {
    const totals = computeTotals([{ unitPrice: 2499_00, quantity: 1 }], percent10, "RAZORPAY");
    expect(totals).toEqual({ subtotal: 2499_00, discount: 249_00, shipping: 0, codFee: 0, total: 2250_00 });
  });

  it("adds the COD fee and shipping when due", () => {
    const totals = computeTotals([{ unitPrice: 999_00, quantity: 1 }], null, "COD");
    expect(totals.shipping).toBe(commerce.shippingFee);
    expect(totals.codFee).toBe(commerce.codFee);
    expect(totals.total).toBe(999_00 + commerce.shippingFee + commerce.codFee);
  });

  it("bases free shipping on the discounted amount", () => {
    const totals = computeTotals([{ unitPrice: 2099_00, quantity: 1 }], flat200, "RAZORPAY");
    expect(totals.subtotal - totals.discount).toBe(1899_00);
    expect(totals.shipping).toBe(commerce.shippingFee);
  });

  it("limits cash on delivery by order value", () => {
    expect(isCodAllowed(commerce.codMaxOrderValue)).toBe(true);
    expect(isCodAllowed(commerce.codMaxOrderValue + 1)).toBe(false);
  });
});
