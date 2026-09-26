"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { openRazorpay } from "@/components/checkout/razorpay";
import { buttonClass } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { formatINR } from "@/lib/money";

export function PayNowButton({
  order,
}: {
  order: {
    id: string;
    orderNumber: string;
    accessToken: string;
    total: number;
    email: string;
    name: string;
    phone: string;
    razorpayOrderId: string | null;
    keyId: string | null;
    demo: boolean;
  };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function pay() {
    setMessage(null);
    if (order.demo) {
      setBusy(true);
      const res = await fetch("/api/payments/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, accessToken: order.accessToken }),
      });
      setBusy(false);
      if (res.ok) router.refresh();
      else setMessage("Demo payment failed.");
      return;
    }
    if (!order.razorpayOrderId || !order.keyId) return;
    try {
      await openRazorpay(
        {
          key: order.keyId,
          amount: order.total,
          currency: "INR",
          name: siteConfig.name,
          description: `Order ${order.orderNumber}`,
          order_id: order.razorpayOrderId,
          prefill: { name: order.name, email: order.email, contact: order.phone },
          theme: { color: "#e3141b", backdrop_color: "#0a0a0b" },
          handler: async (response) => {
            setBusy(true);
            const res = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: order.id, ...response }),
            });
            setBusy(false);
            if (res.ok) router.refresh();
            else setMessage("We received your payment but could not confirm it yet. Don't pay again. We'll email you.");
          },
        },
        (msg) => setMessage(msg),
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not open the payment window.");
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={pay} disabled={busy} className={buttonClass({ size: "lg" })}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : `Pay ${formatINR(order.total)} now`}
      </button>
      {message && <p className="text-sm text-blood">{message}</p>}
    </div>
  );
}
