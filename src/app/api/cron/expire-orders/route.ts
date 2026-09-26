import { NextResponse } from "next/server";
import { expireStaleOrders, tokensMatch } from "@/lib/orders";

// Releases stock from unpaid online orders. Called by Vercel Cron (see
// vercel.json), which sends "Authorization: Bearer <CRON_SECRET>".
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || !tokensMatch(`Bearer ${secret}`, auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const released = await expireStaleOrders();
  return NextResponse.json({ ok: true, released });
}
