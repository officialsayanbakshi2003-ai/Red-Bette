import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "./db";
import { commerce } from "./config";
import { sendOrderConfirmation } from "./email";
import { checkCoupon, computeTotals, isCodAllowed, type CouponRule } from "./pricing";
import { createRazorpayOrder, isDemoPaymentsEnabled, isOnlinePaymentAvailable, isRazorpayConfigured } from "./payments/razorpay";
import type { CheckoutInput } from "./validators";

export class CheckoutError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

const ORDER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ORDER_ALPHABET[bytes[i]! % ORDER_ALPHABET.length];
  return out;
}

export function generateOrderNumber(now = new Date()): string {
  const y = String(now.getUTCFullYear()).slice(2);
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `RB${y}${m}${d}-${randomCode(6)}`;
}

export function generateAccessToken(): string {
  return randomBytes(24).toString("base64url");
}

export function tokensMatch(expected: string, received: string | null | undefined): boolean {
  if (!received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function toCouponRule(c: {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
}): CouponRule {
  return { ...c };
}

/** Loads cart lines from the database so prices always come from the server. */
export async function priceCart(items: { variantId: string; quantity: number }[]) {
  const qtyByVariant = new Map<string, number>();
  for (const item of items) {
    qtyByVariant.set(item.variantId, (qtyByVariant.get(item.variantId) ?? 0) + item.quantity);
  }
  for (const qty of qtyByVariant.values()) {
    if (qty > commerce.maxQtyPerLine) {
      throw new CheckoutError(`You can order at most ${commerce.maxQtyPerLine} of each item.`);
    }
  }

  const variants = await db.productVariant.findMany({
    where: { id: { in: [...qtyByVariant.keys()] } },
    include: { product: { select: { id: true, name: true, slug: true, images: true, price: true, isActive: true } } },
  });
  if (variants.length !== qtyByVariant.size || variants.some((v) => !v.product.isActive)) {
    throw new CheckoutError("Some items in your bag are no longer available. Please review your bag.", 409);
  }

  return variants.map((variant) => ({
    variant,
    quantity: qtyByVariant.get(variant.id)!,
    unitPrice: variant.product.price,
  }));
}

export async function findUsableCoupon(code: string | undefined, subtotal: number) {
  if (!code) return null;
  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon) throw new CheckoutError("That coupon code is not valid.");
  const check = checkCoupon(toCouponRule(coupon), subtotal);
  if (!check.ok) throw new CheckoutError(check.reason);
  return coupon;
}

export interface PlacedOrder {
  orderId: string;
  orderNumber: string;
  accessToken: string;
  total: number;
  paymentMethod: "RAZORPAY" | "COD";
  razorpay?: { keyId: string; orderId: string; amount: number };
  demo?: boolean;
}

export async function placeOrder(input: CheckoutInput, userId: string | null): Promise<PlacedOrder> {
  const lines = await priceCart(input.items);
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const coupon = await findUsableCoupon(input.couponCode, subtotal);
  const totals = computeTotals(lines, coupon ? toCouponRule(coupon) : null, input.paymentMethod);

  if (input.paymentMethod === "COD" && !isCodAllowed(totals.subtotal - totals.discount)) {
    throw new CheckoutError("Cash on delivery is not available for this order value. Please pay online.");
  }
  if (input.paymentMethod === "RAZORPAY" && !isOnlinePaymentAvailable()) {
    throw new CheckoutError("Online payment is temporarily unavailable. Please choose cash on delivery.", 503);
  }

  const isCod = input.paymentMethod === "COD";
  const { address } = input;

  const order = await db.$transaction(async (tx) => {
    // Reserve stock atomically: the conditional update fails if another
    // shopper took the last pieces in the meantime.
    for (const line of lines) {
      const reserved = await tx.productVariant.updateMany({
        where: { id: line.variant.id, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (reserved.count === 0) {
        throw new CheckoutError(
          `${line.variant.product.name} (${line.variant.size}) is sold out or has fewer pieces left than requested.`,
          409,
        );
      }
    }

    if (coupon) {
      const used = await tx.coupon.updateMany({
        where: {
          id: coupon.id,
          isActive: true,
          ...(coupon.maxUses != null ? { usedCount: { lt: coupon.maxUses } } : {}),
        },
        data: { usedCount: { increment: 1 } },
      });
      if (used.count === 0) throw new CheckoutError("This coupon has reached its usage limit.");
    }

    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        accessToken: generateAccessToken(),
        userId,
        email: input.email,
        status: isCod ? "CONFIRMED" : "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: input.paymentMethod,
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        codFee: totals.codFee,
        total: totals.total,
        couponCode: coupon?.code ?? null,
        shipName: address.fullName,
        shipPhone: address.phone,
        shipLine1: address.line1,
        shipLine2: address.line2 ?? null,
        shipCity: address.city,
        shipState: address.state,
        shipPostalCode: address.postalCode,
        items: {
          create: lines.map((line) => ({
            productId: line.variant.product.id,
            variantId: line.variant.id,
            name: line.variant.product.name,
            slug: line.variant.product.slug,
            image: line.variant.product.images[0] ?? null,
            size: line.variant.size,
            color: line.variant.color,
            sku: line.variant.sku,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
          })),
        },
      },
      include: { items: true },
    });

    if (userId && input.saveAddress) {
      const existing = await tx.address.findFirst({
        where: { userId, line1: address.line1, postalCode: address.postalCode },
        select: { id: true },
      });
      if (!existing) {
        const count = await tx.address.count({ where: { userId } });
        await tx.address.create({
          data: {
            userId,
            fullName: address.fullName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 ?? null,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            isDefault: count === 0,
          },
        });
      }
    }

    return created;
  });

  const placed: PlacedOrder = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    accessToken: order.accessToken,
    total: order.total,
    paymentMethod: order.paymentMethod,
  };

  if (isCod) {
    await sendOrderConfirmation(order);
    return placed;
  }

  if (!isRazorpayConfigured() && isDemoPaymentsEnabled()) {
    return { ...placed, demo: true };
  }

  try {
    const rzp = await createRazorpayOrder({
      amount: order.total,
      receipt: order.orderNumber,
      notes: { orderId: order.id, orderNumber: order.orderNumber },
    });
    await db.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzp.id } });
    return {
      ...placed,
      razorpay: { keyId: process.env.RAZORPAY_KEY_ID!, orderId: rzp.id, amount: rzp.amount },
    };
  } catch (error) {
    console.error("[checkout] razorpay order failed", error);
    await releaseOrder(order.id, "Payment gateway error");
    throw new CheckoutError("We couldn't reach the payment gateway. Please try again in a moment.", 502);
  }
}

/**
 * Marks an order as paid. Safe to call repeatedly (checkout callback and
 * webhook may both arrive); only the first call sends the confirmation email.
 */
export async function markOrderPaid(params: {
  where: { id: string } | { razorpayOrderId: string };
  paymentId: string;
  amount?: number;
}): Promise<{ ok: boolean; reason?: string }> {
  const order = await db.order.findFirst({ where: params.where, include: { items: true } });
  if (!order) return { ok: false, reason: "Order not found" };
  if (order.paymentStatus === "PAID") return { ok: true };

  if (params.amount != null && params.amount !== order.total) {
    await db.order.update({
      where: { id: order.id },
      data: { adminNote: `Payment ${params.paymentId} amount ${params.amount} did not match order total ${order.total}.` },
    });
    return { ok: false, reason: "Amount mismatch" };
  }

  let note: string | null = null;
  if (order.stockReleased) {
    // The reservation expired before payment arrived: try to reserve again.
    try {
      await db.$transaction(async (tx) => {
        for (const item of order.items) {
          if (!item.variantId) throw new Error("variant removed");
          const r = await tx.productVariant.updateMany({
            where: { id: item.variantId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (r.count === 0) throw new Error("out of stock");
        }
        await tx.order.update({ where: { id: order.id }, data: { stockReleased: false } });
      });
    } catch {
      note = "Payment arrived after the reservation expired and some items are now out of stock. Fulfil manually or refund.";
    }
  }

  const updated = await db.order.updateMany({
    where: { id: order.id, paymentStatus: { not: "PAID" } },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
      razorpayPaymentId: params.paymentId,
      paidAt: new Date(),
      ...(note ? { adminNote: note } : {}),
    },
  });

  if (updated.count === 1) await sendOrderConfirmation(order);
  return { ok: true };
}

/** Cancels an order and returns its stock and coupon use. Idempotent. */
export async function releaseOrder(orderId: string, reason?: string): Promise<boolean> {
  return db.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: orderId, stockReleased: false },
      data: { stockReleased: true, status: "CANCELLED", ...(reason ? { adminNote: reason } : {}) },
    });
    if (claimed.count === 0) {
      await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
      return false;
    }
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
    for (const item of order.items) {
      if (!item.variantId) continue;
      await tx.productVariant.updateMany({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }
    if (order.couponCode) {
      await tx.coupon.updateMany({
        where: { code: order.couponCode, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
      });
    }
    return true;
  });
}

/** Releases stock held by online orders that were never paid. */
export async function expireStaleOrders(): Promise<number> {
  const cutoff = new Date(Date.now() - commerce.pendingOrderTtlMinutes * 60_000);
  const stale = await db.order.findMany({
    where: {
      status: "PENDING",
      paymentMethod: "RAZORPAY",
      paymentStatus: { not: "PAID" },
      stockReleased: false,
      createdAt: { lt: cutoff },
    },
    select: { id: true },
    take: 200,
  });
  let released = 0;
  for (const { id } of stale) {
    if (await releaseOrder(id, "Payment not completed in time")) released++;
  }
  return released;
}
