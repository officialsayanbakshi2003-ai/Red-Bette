import { Check, CircleDashed, Package, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCartOnMount } from "@/components/orders/ClearCartOnMount";
import { PayNowButton } from "@/components/orders/PayNowButton";
import { formatDateTime, OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/StatusBadge";
import { ProductImage } from "@/components/product/ProductImage";
import { buttonClass } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { commerce, siteConfig, sizeLabel } from "@/lib/config";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { tokensMatch } from "@/lib/orders";
import { isDemoPaymentsEnabled, razorpayKeys } from "@/lib/payments/razorpay";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ token?: string; placed?: string }> };

const STEPS = [
  { key: "CONFIRMED", label: "Confirmed", icon: Check },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Package },
] as const;

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ id }, { token, placed }] = await Promise.all([params, searchParams]);
  if (!/^[a-z0-9]{10,40}$/i.test(id)) notFound();
  const [order, user] = await Promise.all([
    db.order.findUnique({ where: { id }, include: { items: true } }),
    getCurrentUser(),
  ]);
  if (!order) notFound();

  // Access: the owner, an admin, or anyone holding the private link from the confirmation email.
  const allowed =
    user?.role === "ADMIN" || (user && order.userId === user.id) || tokensMatch(order.accessToken, token);
  if (!allowed) notFound();

  const isPaidOrCod = order.paymentStatus === "PAID" || order.paymentMethod === "COD";
  const awaitingPayment =
    order.status === "PENDING" && order.paymentMethod === "RAZORPAY" && order.paymentStatus !== "PAID" && !order.stockReleased;
  const cancelled = order.status === "CANCELLED";
  const reached = (step: (typeof STEPS)[number]["key"]) => {
    const order_ = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
    return order_.indexOf(order.status) >= order_.indexOf(step);
  };
  const keys = razorpayKeys();

  return (
    <div className="container-x py-10 sm:py-14">
      {isPaidOrCod && !cancelled && placed && <ClearCartOnMount />}

      <header className="border-b border-line pb-8">
        {cancelled ? (
          <>
            <p className="eyebrow">Order {order.orderNumber}</p>
            <h1 className="display mt-3 text-4xl sm:text-6xl">
              Order <span className="text-blood">cancelled</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-mist">
              {order.paymentStatus === "PAID"
                ? "This order was cancelled. Your refund is on its way to your original payment method in 5 to 7 working days."
                : "This order was cancelled and you have not been charged."}
            </p>
          </>
        ) : awaitingPayment ? (
          <>
            <p className="eyebrow">Order {order.orderNumber}</p>
            <h1 className="display mt-3 text-4xl sm:text-6xl">
              Almost <span className="text-blood">there</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-mist">
              We&apos;re holding your items for {commerce.pendingOrderTtlMinutes} minutes. Complete the payment to confirm
              your order.
            </p>
            <div className="mt-6">
              <PayNowButton
                order={{
                  id: order.id,
                  orderNumber: order.orderNumber,
                  accessToken: order.accessToken,
                  total: order.total,
                  email: order.email,
                  name: order.shipName,
                  phone: order.shipPhone,
                  razorpayOrderId: order.razorpayOrderId,
                  keyId: keys?.keyId ?? null,
                  demo: isDemoPaymentsEnabled(),
                }}
              />
            </div>
          </>
        ) : (
          <>
            <span className="grid size-12 place-items-center rounded-full bg-blood">
              <Check className="size-6 text-white" strokeWidth={3} />
            </span>
            <p className="eyebrow mt-6">Order {order.orderNumber}</p>
            <h1 className="display mt-3 text-4xl sm:text-6xl">
              Thank you, <span className="text-blood">{order.shipName.split(" ")[0]}</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-mist">
              Your order is confirmed. We&apos;ve sent the details to <span className="text-bone">{order.email}</span>{" "}
              and will let you know when it ships.
            </p>
          </>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-mist">
          <span>Placed {formatDateTime(order.createdAt)}</span>
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} method={order.paymentMethod} />
        </div>
      </header>

      {!cancelled && !awaitingPayment && (
        <ol className="mt-10 grid grid-cols-3 gap-2" aria-label="Order progress">
          {STEPS.map((step) => {
            const done = reached(step.key);
            const Icon = done ? step.icon : CircleDashed;
            return (
              <li key={step.key} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={
                    "grid size-10 place-items-center rounded-full border " +
                    (done ? "border-blood bg-blood text-white" : "border-line text-ash")
                  }
                >
                  <Icon className="size-4" />
                </span>
                <span className={"text-[0.68rem] uppercase tracking-[0.2em] " + (done ? "text-bone" : "text-ash")}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {order.trackingNumber && (
        <p className="mt-8 border border-line bg-coal px-5 py-4 text-sm">
          <Truck className="mr-2 inline size-4 text-blood" />
          Shipped with <span className="font-semibold">{order.courier ?? "our courier partner"}</span>. Tracking
          number: <span className="font-semibold">{order.trackingNumber}</span>
        </p>
      )}

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <section className="lg:col-span-7" aria-labelledby="items-title">
          <h2 id="items-title" className="mb-4 font-display text-lg font-semibold uppercase tracking-[0.15em]">
            Items
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <Link href={`/products/${item.slug}`} className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-char">
                  <ProductImage src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.slug}`} className="font-display text-sm font-medium hover:text-blood">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-mist">
                    {item.color} · {sizeLabel(item.size)} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm tabular-nums">{formatINR(item.unitPrice * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-6 lg:col-span-5">
          <div className="border border-line bg-coal p-6">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.15em]">Payment summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-mist">Subtotal</dt>
                <dd className="tabular-nums">{formatINR(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt>
                  <dd className="tabular-nums">−{formatINR(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-mist">Shipping</dt>
                <dd className="tabular-nums">{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd>
              </div>
              {order.codFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-mist">COD fee</dt>
                  <dd className="tabular-nums">{formatINR(order.codFee)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="font-display font-semibold uppercase tracking-[0.15em]">Total</dt>
                <dd className="font-display text-xl font-bold tabular-nums">{formatINR(order.total)}</dd>
              </div>
              <p className="pt-1 text-xs text-ash">
                {order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online via Razorpay"}
              </p>
            </dl>
          </div>
          <div className="border border-line p-6">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.15em]">Shipping to</h2>
            <address className="text-sm not-italic leading-relaxed text-mist">
              <span className="text-bone">{order.shipName}</span>
              <br />
              {order.shipLine1}
              {order.shipLine2 && (
                <>
                  <br />
                  {order.shipLine2}
                </>
              )}
              <br />
              {order.shipCity}, {order.shipState} {order.shipPostalCode}
              <br />
              +91 {order.shipPhone}
            </address>
          </div>
          <p className="text-xs text-ash">
            Need help with this order? Email{" "}
            <a href={`mailto:${siteConfig.supportEmail}?subject=Order%20${order.orderNumber}`} className="text-bone underline underline-offset-2">
              {siteConfig.supportEmail}
            </a>{" "}
            with your order number.
          </p>
          <Link href="/shop" className={buttonClass({ variant: "outline", block: true })}>
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
