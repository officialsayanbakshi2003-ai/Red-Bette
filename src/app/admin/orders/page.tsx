import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { AdminHeader, Pagination, Table, Td, Th, adminInput } from "@/components/admin/ui";
import { formatDate, OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/StatusBadge";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";

export const metadata = { title: "Orders" };

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const LABELS: Record<string, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "To ship",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
const PER_PAGE = 25;

type Props = { searchParams: Promise<{ status?: string; q?: string; page?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const q = sp.q?.trim().slice(0, 80) || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { shipName: { contains: q, mode: "insensitive" } },
            { shipPhone: { contains: q } },
          ],
        }
      : {}),
  };
  const [total, orders, counts] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { items: true } } },
    }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const href = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { status, q, ...changes };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div>
      <AdminHeader
        title="Orders"
        description={`${total} order${total === 1 ? "" : "s"}`}
        action={
          <a href={`/api/admin/export/orders${status ? `?status=${status}` : ""}`} className="border border-line px-4 py-2 text-sm hover:border-bone">
            Export CSV
          </a>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link
          href={href({ status: undefined, page: undefined })}
          className={"border px-3 py-1.5 text-xs " + (!status ? "border-bone bg-bone text-ink" : "border-line text-mist hover:text-bone")}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={href({ status: s, page: undefined })}
            className={"border px-3 py-1.5 text-xs " + (status === s ? "border-bone bg-bone text-ink" : "border-line text-mist hover:text-bone")}
          >
            {LABELS[s]} <span className="opacity-60">({countFor(s)})</span>
          </Link>
        ))}
        <form className="ml-auto flex w-full gap-2 sm:w-auto" action="/admin/orders">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Order no., email, name, phone" className={adminInput + " sm:w-72"} aria-label="Search orders" />
          <button type="submit" className="border border-line px-4 text-sm hover:border-bone">
            Search
          </button>
        </form>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Order</Th>
            <Th>Date</Th>
            <Th>Customer</Th>
            <Th>Items</Th>
            <Th>Status</Th>
            <Th>Payment</Th>
            <Th className="text-right">Total</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-char/60">
              <Td>
                <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-blood">
                  {o.orderNumber}
                </Link>
              </Td>
              <Td className="whitespace-nowrap text-mist">{formatDate(o.createdAt)}</Td>
              <Td>
                <p className="max-w-[220px] truncate">{o.shipName}</p>
                <p className="max-w-[220px] truncate text-xs text-mist">{o.email}</p>
              </Td>
              <Td className="text-mist">{o._count.items}</Td>
              <Td><OrderStatusBadge status={o.status} /></Td>
              <Td><PaymentStatusBadge status={o.paymentStatus} method={o.paymentMethod} /></Td>
              <Td className="text-right tabular-nums">{formatINR(o.total)}</Td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <Td className="py-10 text-center text-mist" >No orders found.</Td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination page={page} pageCount={Math.max(1, Math.ceil(total / PER_PAGE))} href={(p) => href({ page: String(p) })} />
    </div>
  );
}
