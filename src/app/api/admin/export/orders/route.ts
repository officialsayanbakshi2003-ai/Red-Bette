import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

// Quote each cell and neutralise spreadsheet formula injection.
const cell = (v: string | number | null | undefined) => {
  const s = v == null ? "" : String(v);
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replaceAll('"', '""')}"`;
};
const rupees = (paise: number) => (paise / 100).toFixed(2);

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new Response("Not found", { status: 404 });

  const status = STATUSES.find((s) => s === new URL(request.url).searchParams.get("status"));
  const orders = await db.order.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: { items: true },
  });

  const header = [
    "order_number", "placed_at", "status", "payment_status", "payment_method", "customer", "email", "phone",
    "address", "city", "state", "pin", "items", "subtotal", "discount", "coupon", "shipping", "cod_fee", "total",
    "courier", "tracking_number",
  ];
  const rows = orders.map((o) =>
    [
      o.orderNumber, o.createdAt.toISOString(), o.status, o.paymentStatus, o.paymentMethod, o.shipName, o.email,
      o.shipPhone, [o.shipLine1, o.shipLine2].filter(Boolean).join(", "), o.shipCity, o.shipState, o.shipPostalCode,
      o.items.map((i) => `${i.name} (${i.size}/${i.color}) x${i.quantity}`).join("; "),
      rupees(o.subtotal), rupees(o.discount), o.couponCode, rupees(o.shipping), rupees(o.codFee), rupees(o.total),
      o.courier, o.trackingNumber,
    ]
      .map(cell)
      .join(","),
  );
  const csv = "﻿" + [header.join(","), ...rows].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="red-betta-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
