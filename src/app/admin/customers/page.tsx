import type { Prisma } from "@/generated/prisma/client";
import { AdminHeader, Pagination, Table, Td, Th, adminInput } from "@/components/admin/ui";
import { formatDate } from "@/components/orders/StatusBadge";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";

export const metadata = { title: "Customers" };
const PER_PAGE = 30;

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function CustomersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80) || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const where: Prisma.UserWhereInput = q
    ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }
    : {};
  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    }),
  ]);
  const spend = await db.order.groupBy({
    by: ["userId"],
    where: { userId: { in: users.map((u) => u.id) }, status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] } },
    _sum: { total: true },
    _count: true,
  });
  const byUser = new Map(spend.map((s) => [s.userId, s]));
  const subscribers = await db.newsletterSubscriber.count();

  return (
    <div>
      <AdminHeader
        title="Customers"
        description={`${total} account${total === 1 ? "" : "s"} · ${subscribers} newsletter subscriber${subscribers === 1 ? "" : "s"}`}
        action={
          <a href="/api/admin/export/subscribers" className="border border-line px-4 py-2 text-sm hover:border-bone">
            Export subscribers (CSV)
          </a>
        }
      />
      <form className="mb-5 flex gap-2" action="/admin/customers">
        <input name="q" defaultValue={q} placeholder="Search name, email or phone" className={adminInput + " sm:w-80"} aria-label="Search customers" />
        <button type="submit" className="border border-line px-4 text-sm hover:border-bone">
          Search
        </button>
      </form>
      <Table>
        <thead>
          <tr>
            <Th>Customer</Th>
            <Th>Phone</Th>
            <Th>Joined</Th>
            <Th>Orders</Th>
            <Th className="text-right">Total spent</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const s = byUser.get(u.id);
            return (
              <tr key={u.id}>
                <Td>
                  <p className="font-medium">
                    {u.name} {u.role === "ADMIN" && <span className="ml-1 bg-blood px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-white">Admin</span>}
                  </p>
                  <p className="text-xs text-mist">{u.email}</p>
                </Td>
                <Td className="text-mist">{u.phone ? `+91 ${u.phone}` : "Not added"}</Td>
                <Td className="text-mist">{formatDate(u.createdAt)}</Td>
                <Td className="tabular-nums">{s?._count ?? 0}</Td>
                <Td className="text-right tabular-nums">{formatINR(s?._sum.total ?? 0)}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination page={page} pageCount={Math.max(1, Math.ceil(total / PER_PAGE))} href={(n) => `/admin/customers?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`} />
    </div>
  );
}
