"use server";

import { redirect } from "next/navigation";
import {
  burnPasswordCheck,
  createSession,
  destroySession,
  hashPassword,
  safeNextPath,
  verifyPassword,
} from "@/lib/auth/session";
import { db } from "@/lib/db";
import { limitByIp, rateLimit } from "@/lib/rate-limit";
import { fieldErrors, loginSchema, registerSchema } from "@/lib/validators";
import type { FormState } from "./contact";

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const limited = await limitByIp("register", 5, 60 * 60_000);
  if (!limited.success) return { ok: false, message: "Too many sign-up attempts. Please try again later." };

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { ok: false, errors: { email: "An account with this email already exists. Try signing in." } };
  }

  const user = await db.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
    select: { id: true, role: true, tokenVersion: true },
  });
  // Link earlier guest orders placed with this email.
  await db.order.updateMany({ where: { email, userId: null }, data: { userId: user.id } });

  await createSession(user);
  redirect(safeNextPath(formData.get("next")));
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const ipLimit = await limitByIp("login", 20, 15 * 60_000);
  if (!ipLimit.success) return { ok: false, message: "Too many sign-in attempts. Please wait a few minutes." };

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { email, password } = parsed.data;

  // Also limit per account to slow down password guessing from many IPs.
  const accountLimit = rateLimit(`login-account:${email}`, 10, 15 * 60_000);
  if (!accountLimit.success) return { ok: false, message: "Too many sign-in attempts. Please wait a few minutes." };

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true, tokenVersion: true, passwordHash: true },
  });
  if (!user) {
    await burnPasswordCheck(password);
    return { ok: false, message: "Incorrect email or password." };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, message: "Incorrect email or password." };
  }

  await createSession(user);
  const fallback = user.role === "ADMIN" ? "/admin" : "/account";
  redirect(safeNextPath(formData.get("next"), fallback));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
