import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderUpdateForm } from "@/components/admin/OrderUpdateForm";
import { Card } from "@/components/admin/ui";
import { formatDateTime, OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/StatusBadge";
import { ProductImage } from "@/components/product/ProductImage";
import { sizeLabel } from "@/lib/config";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";

export const metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { id: true, name: true, email: true } } },
  });
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-xs text-mist hover:text-bone">
        <ArrowLeft className="size-3.5" /> All orders
      </Link>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-wide sm:text-3xl">{order.orderNumber}</h1>
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.paymentStatus} method={order.paymentMethod} />
        <Link href={`/orders/${order.id}`} target="_blank" className="ml-auto inline-flex items-center gap-1.5 text-xs text-mist hover:text-bone">
          Customer view <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {order.adminNote && (
        <p className="mb-6 border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm">Note: {order.adminNote}</p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <h2 className="border-b border-line px-5 py-3 text-sm font-semibold">Items</h2>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="relative aspect-[4/5] w-12 shrink-0 bg-char">
                    <ProductImage src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-mist">
                      {item.color} · {sizeLabel(item.size)} · SKU {item.sku}
                    </p>
                  </div>
                  <p className="text-sm tabular-nums text-mist">
                    {item.quantity} × {formatINR(item.unitPrice)}
                  </p>
                  <p className="w-24 text-right text-sm font-medium tabular-nums">{formatINR(item.quantity * item.unitPrice)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-mist">Subtotal</dt><dd className="tabular-nums">{formatINR(order.subtotal)}</dd></div>
              {order.discount > 0 && (
                <div className="flex justify-between"><dt className="text-mist">Discount ({order.couponCode})</dt><dd className="tabular-nums">−{formatINR(order.discount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-mist">Shipping</dt><dd className="tabular-nums">{formatINR(order.shipping)}</dd></div>
              {order.codFee > 0 && (
                <div className="flex justify-between"><dt className="text-mist">COD fee</dt><dd className="tabular-nums">{formatINR(order.codFee)}</dd></div>
              )}
              <div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatINR(order.total)}</dd></div>
            </dl>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold">Customer</h2>
              <p className="text-sm">{order.shipName}</p>
              <p className="text-sm text-mist">{order.email}</p>
              <p className="text-sm text-mist">+91 {order.shipPhone}</p>
              <p className="mt-2 text-xs text-ash">{order.user ? `Registered customer (${order.user.email})` : "Guest checkout"}</p>
            </Card>
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold">Ship to</h2>
              <address className="text-sm not-italic leading-relaxed text-mist">
                {order.shipName}
                <br />
                {order.shipLine1}
                {order.shipLine2 && (<><br />{order.shipLine2}</>)}
                <br />
                {order.shipCity}, {order.shipState} {order.shipPostalCode}
              </address>
            </Card>
          </div>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Payment</h2>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-mist">Method</dt><dd>{order.paymentMethod === "COD" ? "Cash on delivery" : "Razorpay"}</dd></div>
              <div><dt className="text-xs text-mist">Placed</dt><dd>{formatDateTime(order.createdAt)}</dd></div>
              {order.razorpayOrderId && <div><dt className="text-xs text-mist">Razorpay order</dt><dd className="break-all font-mono text-xs">{order.razorpayOrderId}</dd></div>}
              {order.razorpayPaymentId && <div><dt className="text-xs text-mist">Payment ID</dt><dd className="break-all font-mono text-xs">{order.razorpayPaymentId}</dd></div>}
              {order.paidAt && <div><dt className="text-xs text-mist">Paid at</dt><dd>{formatDateTime(order.paidAt)}</dd></div>}
            </dl>
          </Card>
        </div>

        <Card className="h-fit p-5">
          <h2 className="mb-4 text-sm font-semibold">Update order</h2>
          <OrderUpdateForm order={order} />
        </Card>
      </div>
    </div>
  );
}
