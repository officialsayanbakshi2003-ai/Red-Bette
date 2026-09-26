import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { RevenueChart, type RevenuePoint } from "@/components/admin/RevenueChart";
import { AdminHeader, Card, Table, Td, Th } from "@/components/admin/ui";
import { formatDate, OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/StatusBadge";
import { sizeLabel } from "@/lib/config";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { expireStaleOrders } from "@/lib/orders";

export const metadata = { title: "Dashboard" };

const SALE_STATUSES = ["CONFIRMED", "SHIPPED", "DELIVERED"] as const;
const DAY = 24 * 60 * 60 * 1000;
const istDate = (d: Date) => new Date(d.getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default async function AdminDashboard() {
  await expireStaleOrders();
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * DAY);
  const since14 = new Date(now.getTime() - 13 * DAY - (now.getTime() % DAY));

  const [sales30, customers, newCustomers, toShip, pendingPayment, lowStock, recent, recentSales] = await Promise.all([
    db.order.aggregate({
      where: { createdAt: { gte: since30 }, status: { in: [...SALE_STATUSES] } },
      _sum: { total: true },
      _count: true,
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since30 } } }),
    db.order.count({ where: { status: "CONFIRMED" } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.productVariant.findMany({
      where: { stock: { lte: 5 }, product: { isActive: true } },
      orderBy: { stock: "asc" },
      take: 8,
      include: { product: { select: { id: true, name: true } } },
    }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.order.findMany({
      where: { createdAt: { gte: since14 }, status: { in: [...SALE_STATUSES] } },
      select: { createdAt: true, total: true },
    }),
  ]);

  const revenue = sales30._sum.total ?? 0;
  const orders = sales30._count;
  const aov = orders ? Math.round(revenue / orders) : 0;

  const buckets = new Map<string, RevenuePoint>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY);
    const key = istDate(d);
    buckets.set(key, {
      date: key,
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }),
      revenue: 0,
      orders: 0,
    });
  }
  for (const o of recentSales) {
    const b = buckets.get(istDate(o.createdAt));
    if (b) {
      b.revenue += o.total;
      b.orders += 1;
    }
  }

  const stats = [
    { label: "Revenue, last 30 days", value: formatINR(revenue) },
    { label: "Orders, last 30 days", value: orders.toLocaleString("en-IN") },
    { label: "Average order value", value: formatINR(aov) },
    { label: "Customers", value: customers.toLocaleString("en-IN"), sub: `${newCustomers} new this month` },
  ];

  return (
    <div className="space-y-8">
      <AdminHeader title="Dashboard" description="Your store at a glance." />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 sm:p-5">
            <p className="text-xs text-mist">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums sm:text-3xl">{s.value}</p>
            {s.sub && <p className="mt-1 text-xs text-ash">{s.sub}</p>}
          </Card>
        ))}
      </div>

      {(toShip > 0 || pendingPayment > 0) && (
        <div className="flex flex-wrap gap-3">
          {toShip > 0 && (
            <Link href="/admin/orders?status=CONFIRMED" className="flex items-center gap-2 border border-sky-600/40 bg-sky-600/10 px-4 py-2.5 text-sm hover:border-sky-700">
              {toShip} order{toShip === 1 ? "" : "s"} ready to ship <ArrowRight className="size-4" />
            </Link>
          )}
          {pendingPayment > 0 && (
            <Link href="/admin/orders?status=PENDING" className="flex items-center gap-2 border border-amber-600/40 bg-amber-600/10 px-4 py-2.5 text-sm hover:border-amber-700">
              {pendingPayment} awaiting payment <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold">Daily revenue, last 14 days</h2>
          <p className="mb-6 text-xs text-mist">Confirmed, shipped and delivered orders (IST)</p>
          <RevenueChart data={[...buckets.values()]} />
        </Card>
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="size-4 text-amber-700" /> Low stock
          </h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-mist">All sizes are well stocked.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/products/${v.product.id}`} className="min-w-0 truncate hover:text-blood">
                    {v.product.name} <span className="text-mist">· {sizeLabel(v.size)}</span>
                  </Link>
                  <span className={v.stock === 0 ? "shrink-0 text-xs font-semibold text-blood" : "shrink-0 text-xs text-amber-700"}>
                    {v.stock === 0 ? "Sold out" : `${v.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs text-mist hover:text-bone">
            View all
          </Link>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Payment</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="hover:bg-char/60">
                <Td>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-blood">
                    {o.orderNumber}
                  </Link>
                </Td>
                <Td className="text-mist">{formatDate(o.createdAt)}</Td>
                <Td className="max-w-[200px] truncate">{o.shipName}</Td>
                <Td><OrderStatusBadge status={o.status} /></Td>
                <Td><PaymentStatusBadge status={o.paymentStatus} method={o.paymentMethod} /></Td>
                <Td className="text-right tabular-nums">{formatINR(o.total)}</Td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <Td className="text-mist">No orders yet.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </section>
    </div>
  );
}
