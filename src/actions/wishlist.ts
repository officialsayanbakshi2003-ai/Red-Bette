"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export type WishlistResult = { ok: true; wishlisted: boolean } | { ok: false; reason: "auth" | "invalid" };

export async function toggleWishlist(productId: unknown): Promise<WishlistResult> {
  const parsed = z.string().min(1).max(64).safeParse(productId);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "auth" };

  const key = { userId_productId: { userId: user.id, productId: parsed.data } };
  const existing = await db.wishlistItem.findUnique({ where: key });
  if (existing) {
    await db.wishlistItem.delete({ where: key });
    revalidatePath("/wishlist");
    return { ok: true, wishlisted: false };
  }
  const product = await db.product.findFirst({ where: { id: parsed.data, isActive: true }, select: { id: true } });
  if (!product) return { ok: false, reason: "invalid" };
  await db.wishlistItem.create({ data: { userId: user.id, productId: product.id } });
  revalidatePath("/wishlist");
  return { ok: true, wishlisted: true };
}
