"use client";

import { Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { formatINR } from "@/lib/money";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";
import { CartLineItem } from "./CartLineItem";
import { FreeShippingMeter } from "./FreeShippingMeter";
import { hasBlockingIssues, useCartSync } from "./useCartSync";

export function CartPageView() {
  const lines = useCart((s) => s.lines);
  const hydrated = useCart((s) => s.hydrated);
  const { changed } = useCartSync(true);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-mist" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-5 text-center">
        <ShoppingBag className="size-10 text-ash" strokeWidth={1.2} />
        <p className="display text-4xl">Your bag is empty</p>
        <p className="text-sm text-mist">Find something that moves like you do.</p>
        <Link href="/shop" className={buttonClass({ variant: "light" })}>
          Shop the drop
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotal(lines);
  const blocked = hasBlockingIssues(lines);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-8">
        {changed && (
          <p className="mb-4 border border-blood/40 bg-blood/10 px-4 py-3 text-sm">
            Some prices or stock levels changed since you added them. Your bag has been updated.
          </p>
        )}
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((line) => (
            <CartLineItem key={line.variantId} line={line} />
          ))}
        </ul>
        <Link href="/shop" className="mt-6 inline-block text-sm text-mist underline underline-offset-4 hover:text-bone">
          Continue shopping
        </Link>
      </div>
      <aside className="lg:col-span-4">
        <div className="space-y-5 border border-line bg-coal p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold uppercase tracking-[0.15em]">Summary</h2>
          <FreeShippingMeter subtotal={subtotal} />
          <dl className="space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-mist">Items ({cartCount(lines)})</dt>
              <dd className="tabular-nums">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mist">Shipping</dt>
              <dd className="text-mist">At checkout</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-display font-semibold uppercase tracking-[0.15em]">Subtotal</dt>
              <dd className="font-display text-2xl font-bold tabular-nums">{formatINR(subtotal)}</dd>
            </div>
          </dl>
          <p className="text-xs text-ash">Have a coupon? Apply it at checkout. Prices include GST.</p>
          <Link
            href="/checkout"
            aria-disabled={blocked}
            className={buttonClass({ size: "lg", block: true, className: blocked ? "pointer-events-none opacity-50" : "" })}
          >
            Checkout
          </Link>
          {blocked && <p className="text-xs text-blood">Remove sold-out items to continue.</p>}
        </div>
      </aside>
    </div>
  );
}
