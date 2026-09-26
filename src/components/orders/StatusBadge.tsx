import { clsx } from "clsx";

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Awaiting payment", className: "border-amber-400/40 text-amber-300" },
  CONFIRMED: { label: "Confirmed", className: "border-sky-400/40 text-sky-300" },
  SHIPPED: { label: "Shipped", className: "border-violet-400/40 text-violet-300" },
  DELIVERED: { label: "Delivered", className: "border-emerald-400/40 text-emerald-300" },
  CANCELLED: { label: "Cancelled", className: "border-line text-ash" },
};

const PAYMENT_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Unpaid", className: "border-amber-400/40 text-amber-300" },
  PAID: { label: "Paid", className: "border-emerald-400/40 text-emerald-300" },
  FAILED: { label: "Payment failed", className: "border-blood/50 text-blood" },
  REFUNDED: { label: "Refunded", className: "border-line text-mist" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] ?? { label: status, className: "border-line text-mist" };
  return (
    <span className={clsx("inline-flex border px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider", s.className)}>
      {s.label}
    </span>
  );
}

export function PaymentStatusBadge({ status, method }: { status: string; method?: string }) {
  const s =
    method === "COD" && status === "PENDING"
      ? { label: "Pay on delivery", className: "border-line text-mist" }
      : PAYMENT_STATUS[status] ?? { label: status, className: "border-line text-mist" };
  return (
    <span className={clsx("inline-flex border px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider", s.className)}>
      {s.label}
    </span>
  );
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export const formatDateTime = (d: Date) =>
  d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
