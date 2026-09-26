import { Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { isDemoPaymentsEnabled, isOnlinePaymentAvailable } from "@/lib/payments/razorpay";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const addresses = user
    ? await db.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: { id: true, fullName: true, phone: true, line1: true, line2: true, city: true, state: true, postalCode: true, isDefault: true },
      })
    : [];

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
        <div>
          <nav aria-label="Breadcrumb" className="text-xs text-ash">
            <Link href="/cart" className="hover:text-bone">Bag</Link> <span aria-hidden="true">/</span>{" "}
            <span className="text-mist">Checkout</span>
          </nav>
          <h1 className="display mt-3 text-5xl sm:text-6xl">Checkout</h1>
        </div>
        <p className="flex items-center gap-2 text-xs text-mist">
          <Lock className="size-3.5" /> Secure checkout
        </p>
      </div>
      <CheckoutForm
        user={user ? { name: user.name, email: user.email, phone: user.phone } : null}
        addresses={addresses}
        onlinePayments={isOnlinePaymentAvailable()}
        demoPayments={isDemoPaymentsEnabled()}
      />
    </div>
  );
}
