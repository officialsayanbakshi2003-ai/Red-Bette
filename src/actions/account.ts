"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { limitByIp } from "@/lib/rate-limit";
import { addressSchema, changePasswordSchema, fieldErrors, profileSchema } from "@/lib/validators";
import type { FormState } from "./contact";

async function userOrRedirect() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  return user;
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await userOrRedirect();
  const parsed = profileSchema.safeParse({ name: formData.get("name"), phone: formData.get("phone") ?? "" });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone ? parsed.data.phone : null },
  });
  revalidatePath("/account", "layout");
  return { ok: true, message: "Profile updated." };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await userOrRedirect();
  const limited = await limitByIp("change-password", 10, 15 * 60_000);
  if (!limited.success) return { ok: false, message: "Too many attempts. Please try again later." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const row = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
  if (!(await verifyPassword(parsed.data.currentPassword, row.passwordHash))) {
    return { ok: false, errors: { currentPassword: "Your current password is incorrect." } };
  }
  // Bumping tokenVersion signs out every other device.
  const updated = await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword), tokenVersion: { increment: 1 } },
    select: { id: true, role: true, tokenVersion: true },
  });
  await createSession(updated);
  return { ok: true, message: "Password changed. Other devices have been signed out." };
}

export async function signOutEverywhere() {
  const user = await userOrRedirect();
  await db.user.update({ where: { id: user.id }, data: { tokenVersion: { increment: 1 } } });
  await destroySession();
  redirect("/login");
}

export async function saveAddress(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await userOrRedirect();
  const parsed = addressSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2") ?? undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  const count = await db.address.count({ where: { userId: user.id } });
  if (count >= 10) return { ok: false, message: "You can save up to 10 addresses." };
  const makeDefault = count === 0 || formData.get("isDefault") === "on";

  await db.$transaction(async (tx) => {
    if (makeDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    await tx.address.create({
      data: { ...parsed.data, line2: parsed.data.line2 ?? null, userId: user.id, isDefault: makeDefault },
    });
  });
  revalidatePath("/account/addresses");
  return { ok: true, message: "Address saved." };
}

export async function deleteAddress(addressId: unknown) {
  const user = await userOrRedirect();
  const id = z.string().min(1).max(64).parse(addressId);
  const address = await db.address.findFirst({ where: { id, userId: user.id } });
  if (!address) return;
  await db.address.delete({ where: { id } });
  if (address.isDefault) {
    const next = await db.address.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    if (next) await db.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(addressId: unknown) {
  const user = await userOrRedirect();
  const id = z.string().min(1).max(64).parse(addressId);
  const address = await db.address.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!address) return;
  await db.$transaction([
    db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    db.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
}
