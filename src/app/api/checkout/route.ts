import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSameOrigin, jsonError, readJson } from "@/lib/http";
import { CheckoutError, expireStaleOrders, placeOrder } from "@/lib/orders";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { checkoutSchema, fieldErrors } from "@/lib/validators";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Forbidden", 403);
  const limited = rateLimit(`checkout:${clientIpFrom(request.headers)}`, 12, 10 * 60_000);
  if (!limited.success) {
    return jsonError("Too many checkout attempts. Please wait a few minutes.", 429, {
      retryAfter: limited.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return jsonError("Invalid request.", 400);
  }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Please check your details.", 422, { errors: fieldErrors(parsed.error) });
  }

  try {
    // Free up stock held by abandoned online payments before reserving new stock.
    await expireStaleOrders();
    const user = await getCurrentUser();
    const placed = await placeOrder(parsed.data, user?.id ?? null);
    return NextResponse.json(placed, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutError) return jsonError(error.message, error.status);
    console.error("[checkout] unexpected error", error);
    return jsonError("Something went wrong while placing your order. Please try again.", 500);
  }
}
