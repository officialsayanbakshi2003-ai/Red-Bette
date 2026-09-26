"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sendShippingUpdate } from "@/lib/email";
import { MEDIA_SLOTS, type MediaSlot } from "@/lib/media";
import { releaseOrder } from "@/lib/orders";
import { mediaSettingKey } from "@/lib/site-media";
import {
  categoryInputSchema,
  couponInputSchema,
  fieldErrors,
  orderUpdateSchema,
  productInputSchema,
  type ProductInput,
} from "@/lib/validators";
import type { FormState } from "./contact";

const idSchema = z.string().min(1).max(64);

function revalidateStore() {
  revalidatePath("/", "layout");
}

// ---------------- Products ----------------

export type ProductSaveResult = { ok: true; id: string } | { ok: false; message: string; errors?: Record<string, string> };

export async function saveProduct(productId: string | null, input: ProductInput): Promise<ProductSaveResult> {
  await requireAdmin();
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  const data = parsed.data;
  const compareAtPrice = data.compareAtPrice && data.compareAtPrice > 0 ? data.compareAtPrice : null;

  try {
    const id = await db.$transaction(async (tx) => {
      const base = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        details: data.details,
        price: data.price,
        compareAtPrice,
        categoryId: data.categoryId,
        images: data.images,
        tags: data.tags.map((t) => t.toLowerCase()),
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      };
      const product = productId
        ? await tx.product.update({ where: { id: productId }, data: base })
        : await tx.product.create({ data: base });

      const existing = await tx.productVariant.findMany({ where: { productId: product.id }, select: { id: true } });
      const keepIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id!));
      const toRemove = existing.filter((v) => !keepIds.has(v.id)).map((v) => v.id);
      if (toRemove.length) await tx.productVariant.deleteMany({ where: { id: { in: toRemove } } });

      // Free up SKUs/size-colour combos first so swaps between rows don't collide.
      for (const v of data.variants.filter((v) => v.id && existing.some((e) => e.id === v.id))) {
        await tx.productVariant.update({ where: { id: v.id }, data: { sku: `TMP-${v.id}`, size: `TMP-${v.id}` } });
      }
      for (const v of data.variants) {
        const values = { size: v.size, color: v.color, sku: v.sku, stock: v.stock };
        if (v.id && existing.some((e) => e.id === v.id)) {
          await tx.productVariant.update({ where: { id: v.id }, data: values });
        } else {
          await tx.productVariant.create({ data: { ...values, productId: product.id } });
        }
      }
      return product.id;
    });
    revalidateStore();
    return { ok: true, id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = String((error.meta as { target?: unknown })?.target ?? "");
      if (target.includes("slug")) return { ok: false, message: "Another product already uses this URL slug.", errors: { slug: "Already in use." } };
      if (target.includes("sku")) return { ok: false, message: "One of these SKUs is already used by another product.", errors: { variants: "SKU already in use." } };
      return { ok: false, message: "A unique value is already in use." };
    }
    console.error("[admin] saveProduct failed", error);
    return { ok: false, message: "Could not save the product. Please try again." };
  }
}

export async function deleteProduct(productId: unknown) {
  await requireAdmin();
  const id = idSchema.parse(productId);
  const hasOrders = await db.orderItem.count({ where: { productId: id } });
  if (hasOrders > 0) {
    // Keep order history intact: archive instead of deleting.
    await db.product.update({ where: { id }, data: { isActive: false } });
  } else {
    await db.product.delete({ where: { id } });
  }
  revalidateStore();
  redirect("/admin/products");
}

// ---------------- Categories ----------------

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = formData.get("id");
  const parsed = categoryInputSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  try {
    if (typeof id === "string" && id) {
      await db.category.update({ where: { id }, data: { ...parsed.data, description: parsed.data.description ?? null } });
    } else {
      await db.category.create({ data: { ...parsed.data, description: parsed.data.description ?? null } });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, errors: { slug: "This slug is already used." } };
    }
    throw error;
  }
  revalidateStore();
  return { ok: true, message: "Category saved." };
}

export async function deleteCategory(categoryId: unknown): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const id = idSchema.parse(categoryId);
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) return { ok: false, message: "Move or delete this category's products first." };
  await db.category.delete({ where: { id } });
  revalidateStore();
  return { ok: true };
}

// ---------------- Orders ----------------

export async function updateOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = orderUpdateSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    paymentStatus: formData.get("paymentStatus"),
    courier: formData.get("courier") || undefined,
    trackingNumber: formData.get("trackingNumber") || undefined,
    adminNote: formData.get("adminNote") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const input = parsed.data;

  const order = await db.order.findUnique({ where: { id: input.orderId } });
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status === "CANCELLED" && input.status !== "CANCELLED") {
    return { ok: false, message: "Cancelled orders can't be reopened. Ask the customer to place a new order." };
  }
  if (input.status === "PENDING" && order.status !== "PENDING") {
    return { ok: false, message: "An order can't be moved back to awaiting payment." };
  }
  if (input.status === "SHIPPED" && !input.trackingNumber && !order.trackingNumber) {
    return { ok: false, errors: { trackingNumber: "Add a tracking number before marking as shipped." } };
  }

  if (input.status === "CANCELLED" && order.status !== "CANCELLED") {
    await releaseOrder(order.id);
  }

  const updated = await db.order.update({
    where: { id: order.id },
    data: {
      status: input.status,
      paymentStatus: input.paymentStatus,
      courier: input.courier ?? null,
      trackingNumber: input.trackingNumber ?? null,
      adminNote: input.adminNote ?? null,
      ...(input.paymentStatus === "PAID" && !order.paidAt ? { paidAt: new Date() } : {}),
    },
  });

  if (input.status === "SHIPPED" && order.status !== "SHIPPED") {
    await sendShippingUpdate(updated);
  }
  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin/orders");
  return { ok: true, message: "Order updated." };
}

// ---------------- Coupons ----------------

export async function createCoupon(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = couponInputSchema.safeParse({
    code: formData.get("code"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    value: formData.get("value"),
    minSubtotal: formData.get("minSubtotal") || 0,
    maxDiscount: formData.get("maxDiscount") || undefined,
    maxUses: formData.get("maxUses") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
    isActive: true,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const c = parsed.data;
  try {
    await db.coupon.create({
      data: {
        code: c.code,
        description: c.description ?? null,
        type: c.type,
        // Rupee amounts from the form are stored in paise.
        value: c.type === "FIXED" ? Math.round(c.value * 100) : Math.round(c.value),
        minSubtotal: Math.round(c.minSubtotal * 100),
        maxDiscount: c.maxDiscount != null ? Math.round(c.maxDiscount * 100) : null,
        maxUses: c.maxUses ?? null,
        // Date inputs arrive as UTC midnight; expire at 23:59:59 IST on that date.
        expiresAt: c.expiresAt ? new Date(c.expiresAt.getTime() + 18.5 * 60 * 60 * 1000 - 1) : null,
        isActive: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, errors: { code: "This code already exists." } };
    }
    throw error;
  }
  revalidatePath("/admin/coupons");
  return { ok: true, message: "Coupon created." };
}

export async function toggleCoupon(couponId: unknown) {
  await requireAdmin();
  const id = idSchema.parse(couponId);
  const coupon = await db.coupon.findUnique({ where: { id }, select: { isActive: true } });
  if (!coupon) return;
  await db.coupon.update({ where: { id }, data: { isActive: !coupon.isActive } });
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(couponId: unknown) {
  await requireAdmin();
  const id = idSchema.parse(couponId);
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}

// ---------------- Messages ----------------

export async function toggleMessageRead(messageId: unknown) {
  await requireAdmin();
  const id = idSchema.parse(messageId);
  const msg = await db.contactMessage.findUnique({ where: { id }, select: { isRead: true } });
  if (!msg) return;
  await db.contactMessage.update({ where: { id }, data: { isRead: !msg.isRead } });
  revalidatePath("/admin/messages");
}

// ---------------- Storefront media ----------------

const slotSchema = z.enum(Object.keys(MEDIA_SLOTS) as [MediaSlot, ...MediaSlot[]]);
const mediaUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v.startsWith("/") || /^https:\/\//.test(v), "Use an https URL or an uploaded image.");

export async function setStorefrontImage(slot: unknown, url: unknown): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const s = slotSchema.safeParse(slot);
  const u = mediaUrlSchema.safeParse(url);
  if (!s.success || !u.success) return { ok: false, message: "Invalid image." };
  await db.siteSetting.upsert({
    where: { key: mediaSettingKey(s.data) },
    update: { value: u.data },
    create: { key: mediaSettingKey(s.data), value: u.data },
  });
  revalidateStore();
  return { ok: true };
}

export async function resetStorefrontImage(slot: unknown) {
  await requireAdmin();
  const s = slotSchema.parse(slot);
  await db.siteSetting.deleteMany({ where: { key: mediaSettingKey(s) } });
  revalidateStore();
}
