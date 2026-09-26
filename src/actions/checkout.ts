"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { checkCoupon } from "@/lib/pricing";
import { toCouponRule } from "@/lib/orders";
import { limitByIp } from "@/lib/rate-limit";

export type CouponPreview =
  | {
      ok: true;
      code: string;
      type: "PERCENT" | "FIXED";
      value: number;
      minSubtotal: number;
      maxDiscount: number | null;
      description: string | null;
    }
  | { ok: false; message: string };

/** Checks a coupon for display in the checkout. The order API re-validates it. */
export async function previewCoupon(rawCode: unknown, rawSubtotal: unknown): Promise<CouponPreview> {
  const limited = await limitByIp("coupon", 20, 10 * 60_000);
  if (!limited.success) return { ok: false, message: "Too many attempts. Please try again later." };

  const parsed = z
    .object({ code: z.string().trim().toUpperCase().min(1).max(32), subtotal: z.number().int().min(0).max(100_000_000) })
    .safeParse({ code: rawCode, subtotal: rawSubtotal });
  if (!parsed.success) return { ok: false, message: "Enter a valid coupon code." };

  const coupon = await db.coupon.findUnique({ where: { code: parsed.data.code } });
  if (!coupon) return { ok: false, message: "That coupon code is not valid." };
  const check = checkCoupon(toCouponRule(coupon), parsed.data.subtotal);
  if (!check.ok) return { ok: false, message: check.reason };

  return {
    ok: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minSubtotal: coupon.minSubtotal,
    maxDiscount: coupon.maxDiscount,
    description: coupon.description,
  };
}
