import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession, verifySession } from "./token";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// A real bcrypt hash of a random string, compared against when a login email
// does not exist so response timing does not reveal which emails are registered.
const DUMMY_HASH = "$2b$12$QltdEcf6PEBRRYjTUKgerel6vrrjVMyFwweHNkWiHcnHSflKSZCWO";
export async function burnPasswordCheck(password: string): Promise<void> {
  await bcrypt.compare(password, DUMMY_HASH).catch(() => false);
}

export async function createSession(user: { id: string; role: "CUSTOMER" | "ADMIN"; tokenVersion: number }) {
  const token = await signSession({ sub: user.id, role: user.role, ver: user.tokenVersion });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
};

/** Returns the signed-in user, re-checked against the database on every request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, phone: true, role: true, tokenVersion: true },
  });
  // Sessions die when the user is deleted or their token version is bumped.
  if (!user || user.tokenVersion !== session.ver) return null;
  return { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
});

export async function requireUser(nextPath = "/account"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** Guards every admin page and action. Non-admins get a 404 so the admin area is not advertised. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") notFound();
  return user;
}

/** Only allow same-site relative redirects after login, to prevent open redirects. */
export function safeNextPath(next: unknown, fallback = "/account"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
