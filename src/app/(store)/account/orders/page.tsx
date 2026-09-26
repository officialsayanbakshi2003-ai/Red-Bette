import type { Metadata } from "next";
import Link from "next/link";
import { OrderList } from "@/components/orders/OrderList";
import { buttonClass } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: { select: { id: true, image: true, name: true, quantity: true } } },
  });
  return (
    <section>
      <h2 className="mb-4 font-display text-lg font-semibold uppercase tracking-[0.15em]">Order history</h2>
      {orders.length === 0 ? (
        <div className="border border-dashed border-line p-8 text-center">
          <p className="text-sm text-mist">No orders yet. Your first drop is waiting.</p>
          <Link href="/shop" className={buttonClass({ variant: "light", className: "mt-5" })}>
            Shop now
          </Link>
        </div>
      ) : (
        <OrderList orders={orders} />
      )}
    </section>
  );
}
