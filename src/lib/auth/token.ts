// JWT helpers with no Node-only or database imports, so the proxy can use them too.
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "rb_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  sub: string; // user id
  role: "CUSTOMER" | "ADMIN";
  ver: number; // user's tokenVersion when the session was issued
}

let cachedKey: Uint8Array | null = null;

function getKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  }
  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, ver: payload.ver })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .setIssuer("red-betta")
    .setAudience("red-betta-web")
    .sign(getKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
      issuer: "red-betta",
      audience: "red-betta-web",
    });
    if (typeof payload.sub !== "string") return null;
    const role = payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
    const ver = typeof payload.ver === "number" ? payload.ver : -1;
    return { sub: payload.sub, role, ver };
  } catch {
    return null;
  }
}
