import type { Metadata } from "next";
import Link from "next/link";
import { OrderList } from "@/components/orders/OrderList";
import { buttonClass } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const [orders, orderCount, wishlistCount, addressCount] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { items: { select: { id: true, image: true, name: true, quantity: true } } },
    }),
    db.order.count({ where: { userId: user.id } }),
    db.wishlistItem.count({ where: { userId: user.id } }),
    db.address.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-12">
      <dl className="grid grid-cols-3 gap-px border border-line bg-line">
        {[
          ["Orders", orderCount, "/account/orders"],
          ["Wishlist", wishlistCount, "/wishlist"],
          ["Addresses", addressCount, "/account/addresses"],
        ].map(([label, value, href]) => (
          <Link key={label as string} href={href as string} className="bg-ink p-4 transition-colors hover:bg-coal sm:p-6">
            <dt className="eyebrow">{label}</dt>
            <dd className="mt-2 font-display text-3xl font-bold italic">{value}</dd>
          </Link>
        ))}
      </dl>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold uppercase tracking-[0.15em]">Recent orders</h2>
          {orderCount > 3 && (
            <Link href="/account/orders" className="text-xs text-mist underline-offset-4 hover:text-bone hover:underline">
              View all
            </Link>
          )}
        </div>
        {orders.length === 0 ? (
          <div className="border border-dashed border-line p-8 text-center">
            <p className="text-sm text-mist">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className={buttonClass({ variant: "light", className: "mt-5" })}>
              Start shopping
            </Link>
          </div>
        ) : (
          <OrderList orders={orders} />
        )}
      </section>
    </div>
  );
}
