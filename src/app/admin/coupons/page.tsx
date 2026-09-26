import { deleteCoupon, toggleCoupon } from "@/actions/admin";
import { CouponForm } from "@/components/admin/CouponForm";
import { ActionButton } from "@/components/admin/RowActions";
import { AdminHeader, Table, Td, Th } from "@/components/admin/ui";
import { formatDate } from "@/components/orders/StatusBadge";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";

export const metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();
  return (
    <div>
      <AdminHeader title="Coupons" description="Discount codes customers can apply at checkout." />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Discount</Th>
                <Th>Conditions</Th>
                <Th>Used</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired = c.expiresAt != null && c.expiresAt < now;
                const exhausted = c.maxUses != null && c.usedCount >= c.maxUses;
                const live = c.isActive && !expired && !exhausted;
                return (
                  <tr key={c.id}>
                    <Td>
                      <p className="font-mono font-semibold">{c.code}</p>
                      {c.description && <p className="max-w-[220px] truncate text-xs text-mist">{c.description}</p>}
                    </Td>
                    <Td>
                      {c.type === "PERCENT" ? `${c.value}%` : formatINR(c.value)}
                      {c.maxDiscount != null && <span className="block text-xs text-mist">up to {formatINR(c.maxDiscount)}</span>}
                    </Td>
                    <Td className="text-xs text-mist">
                      {c.minSubtotal > 0 ? `Min. ${formatINR(c.minSubtotal)}` : "No minimum"}
                      {c.expiresAt && <span className="block">Until {formatDate(c.expiresAt)}</span>}
                    </Td>
                    <Td className="tabular-nums text-mist">
                      {c.usedCount}
                      {c.maxUses != null ? ` / ${c.maxUses}` : ""}
                    </Td>
                    <Td>
                      <span className={"border px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider " + (live ? "border-emerald-600/40 text-emerald-700" : "border-line text-ash")}>
                        {live ? "Live" : expired ? "Expired" : exhausted ? "Used up" : "Paused"}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap text-right">
                      <ActionButton action={toggleCoupon.bind(null, c.id)}>{c.isActive ? "Pause" : "Activate"}</ActionButton>
                      <span className="mx-2 text-line">|</span>
                      <ActionButton action={deleteCoupon.bind(null, c.id)} confirmText={`Delete coupon ${c.code}?`} className="text-xs text-blood underline-offset-4 hover:underline">
                        Delete
                      </ActionButton>
                    </Td>
                  </tr>
                );
              })}
              {coupons.length === 0 && (
                <tr>
                  <Td className="py-10 text-center text-mist">No coupons yet.</Td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <CouponForm />
      </div>
    </div>
  );
}
