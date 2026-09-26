// Pure pricing logic shared by the cart UI and the server.
// The server always recomputes totals from database prices; the client
// copy is only used for display.

import { commerce } from "./config";

export type PaymentMethodCode = "RAZORPAY" | "COD";

export interface PricedLine {
  unitPrice: number; // paise
  quantity: number;
}

export interface CouponRule {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSubtotal: number;
  maxDiscount?: number | null;
  maxUses?: number | null;
  usedCount?: number;
  isActive?: boolean;
  startsAt?: Date | null;
  expiresAt?: Date | null;
}

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  codFee: number;
  total: number;
}

export function computeSubtotal(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

export type CouponCheck = { ok: true } | { ok: false; reason: string };

export function checkCoupon(coupon: CouponRule, subtotal: number, now = new Date()): CouponCheck {
  if (coupon.isActive === false) return { ok: false, reason: "This coupon is no longer active." };
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, reason: "This coupon is not active yet." };
  if (coupon.expiresAt && coupon.expiresAt < now) return { ok: false, reason: "This coupon has expired." };
  if (coupon.maxUses != null && (coupon.usedCount ?? 0) >= coupon.maxUses) {
    return { ok: false, reason: "This coupon has reached its usage limit." };
  }
  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      reason: `Add items worth ₹${Math.ceil((coupon.minSubtotal - subtotal) / 100)} more to use this coupon.`,
    };
  }
  return { ok: true };
}

export function computeDiscount(coupon: CouponRule | null | undefined, subtotal: number): number {
  if (!coupon || subtotal <= 0) return 0;
  // Percentage discounts are rounded down to whole rupees so totals stay clean.
  let discount =
    coupon.type === "PERCENT"
      ? Math.floor((subtotal * Math.min(Math.max(coupon.value, 0), 100)) / 100 / 100) * 100
      : Math.max(coupon.value, 0);
  if (coupon.type === "PERCENT" && coupon.maxDiscount != null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  return Math.min(discount, subtotal);
}

export function computeShipping(amountAfterDiscount: number): number {
  if (amountAfterDiscount <= 0) return 0;
  return amountAfterDiscount >= commerce.freeShippingThreshold ? 0 : commerce.shippingFee;
}

export function isCodAllowed(amountAfterDiscount: number): boolean {
  return amountAfterDiscount <= commerce.codMaxOrderValue;
}

export function computeTotals(
  lines: PricedLine[],
  coupon: CouponRule | null | undefined,
  paymentMethod: PaymentMethodCode,
): Totals {
  const subtotal = computeSubtotal(lines);
  const discount = computeDiscount(coupon, subtotal);
  const afterDiscount = subtotal - discount;
  const shipping = computeShipping(afterDiscount);
  const codFee = paymentMethod === "COD" && afterDiscount > 0 ? commerce.codFee : 0;
  return { subtotal, discount, shipping, codFee, total: afterDiscount + shipping + codFee };
}
