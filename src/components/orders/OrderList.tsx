import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { formatINR } from "@/lib/money";
import { formatDate, OrderStatusBadge } from "./StatusBadge";

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  items: { id: string; image: string | null; name: string; quantity: number }[];
}

export function OrderList({ orders }: { orders: OrderListItem[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {orders.map((order) => {
        const count = order.items.reduce((n, i) => n + i.quantity, 0);
        return (
          <li key={order.id}>
            <Link href={`/orders/${order.id}`} className="group flex items-center gap-4 py-5">
              <div className="flex -space-x-6">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="relative aspect-[4/5] w-14 overflow-hidden border-2 border-ink bg-char sm:w-16">
                    <ProductImage src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  </div>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-semibold tracking-wide">{order.orderNumber}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-xs text-mist">
                  {formatDate(order.createdAt)} · {count} item{count === 1 ? "" : "s"} · {formatINR(order.total)}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-mist transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
