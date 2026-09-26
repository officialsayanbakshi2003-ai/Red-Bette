import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { markOrderPaid } from "@/lib/orders";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

// Razorpay webhook: the source of truth for payments even if the shopper
// closes the tab before the browser callback runs.
// Configure in Razorpay Dashboard → Webhooks with events:
// payment.captured, order.paid, payment.failed, refund.processed

interface PaymentEntity {
  id: string;
  order_id: string | null;
  amount: number;
  status: string;
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const signature = request.headers.get("x-razorpay-signature");
  const raw = await request.text();
  if (!signature || raw.length > 1_000_000 || !verifyWebhookSignature(raw, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload: Record<string, { entity: Record<string, unknown> }> };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const payment = event.payload.payment?.entity as unknown as PaymentEntity | undefined;
    switch (event.event) {
      case "payment.captured":
      case "order.paid": {
        const orderId = payment?.order_id ?? (event.payload.order?.entity?.id as string | undefined);
        if (payment && orderId) {
          await markOrderPaid({ where: { razorpayOrderId: orderId }, paymentId: payment.id, amount: payment.amount });
        }
        break;
      }
      case "payment.failed": {
        if (payment?.order_id) {
          await db.order.updateMany({
            where: { razorpayOrderId: payment.order_id, paymentStatus: "PENDING" },
            data: { paymentStatus: "FAILED" },
          });
        }
        break;
      }
      case "refund.processed": {
        const paymentId = event.payload.refund?.entity?.payment_id as string | undefined;
        if (paymentId) {
          await db.order.updateMany({ where: { razorpayPaymentId: paymentId }, data: { paymentStatus: "REFUNDED" } });
        }
        break;
      }
    }
  } catch (error) {
    console.error("[webhook] processing failed", error);
    // Non-2xx makes Razorpay retry later.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
