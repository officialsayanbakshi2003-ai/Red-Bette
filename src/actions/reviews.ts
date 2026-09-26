"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { limitByIp } from "@/lib/rate-limit";
import { fieldErrors, reviewSchema } from "@/lib/validators";
import type { FormState } from "./contact";

export async function submitReview(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in to write a review." };

  const limited = await limitByIp("review", 10, 60 * 60_000);
  if (!limited.success) return { ok: false, message: "Too many reviews. Please try again later." };

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    title: formData.get("title") ?? undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  const product = await db.product.findFirst({
    where: { id: parsed.data.productId, isActive: true },
    select: { id: true, slug: true },
  });
  if (!product) return { ok: false, message: "This product is no longer available." };

  // Only verified buyers can review.
  const purchased = await db.orderItem.findFirst({
    where: {
      productId: product.id,
      order: { userId: user.id, OR: [{ paymentStatus: "PAID" }, { status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] } }] },
    },
    select: { id: true },
  });
  if (!purchased) return { ok: false, message: "Only customers who bought this item can review it." };

  await db.review.upsert({
    where: { productId_userId: { productId: product.id, userId: user.id } },
    update: { rating: parsed.data.rating, title: parsed.data.title ?? null, body: parsed.data.body },
    create: {
      productId: product.id,
      userId: user.id,
      rating: parsed.data.rating,
      title: parsed.data.title ?? null,
      body: parsed.data.body,
    },
  });
  revalidatePath(`/products/${product.slug}`);
  return { ok: true, message: "Thanks for your review!" };
}
