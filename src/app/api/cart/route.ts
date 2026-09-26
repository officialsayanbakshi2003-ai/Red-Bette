import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { jsonError, readJson } from "@/lib/http";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";

// Returns live price/stock for the variants in a shopper's bag so the
// client-side cart can refresh stale prices and flag sold-out items.

const bodySchema = z.object({ variantIds: z.array(z.string().min(1).max(64)).max(50) });

export async function POST(request: Request) {
  const limited = rateLimit(`cart:${clientIpFrom(request.headers)}`, 120, 60_000);
  if (!limited.success) return jsonError("Too many requests", 429);

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await readJson(request));
  } catch {
    return jsonError("Invalid request", 400);
  }

  const variants = await db.productVariant.findMany({
    where: { id: { in: body.variantIds } },
    select: {
      id: true,
      size: true,
      color: true,
      stock: true,
      product: { select: { id: true, slug: true, name: true, price: true, images: true, isActive: true } },
    },
  });

  return NextResponse.json({
    items: variants.map((v) => ({
      variantId: v.id,
      productId: v.product.id,
      slug: v.product.slug,
      name: v.product.name,
      image: v.product.images[0] ?? null,
      size: v.size,
      color: v.color,
      unitPrice: v.product.price,
      stock: v.product.isActive ? v.stock : 0,
    })),
  });
}
