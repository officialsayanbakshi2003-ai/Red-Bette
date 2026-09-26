import "server-only";
import { headers } from "next/headers";

// Fixed-window in-memory rate limiter. It protects a single server instance;
// on multi-instance/serverless deployments swap the store for Redis/Upstash
// (same interface) for a global limit.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, retryAfterSeconds: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { success: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { success: true, retryAfterSeconds: 0 };
}

export function clientIpFrom(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

export async function clientIp(): Promise<string> {
  return clientIpFrom(await headers());
}

/** Convenience wrapper for server actions: limits by client IP + action name. */
export async function limitByIp(action: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  return rateLimit(`${action}:${await clientIp()}`, limit, windowMs);
}
