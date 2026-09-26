"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { buttonClass } from "@/components/ui/button";
import { formatINR } from "@/lib/money";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";
import { CartLineItem } from "./CartLineItem";
import { FreeShippingMeter } from "./FreeShippingMeter";
import { hasBlockingIssues, useCartSync } from "./useCartSync";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const lines = useCart((s) => s.lines);
  const hydrated = useCart((s) => s.hydrated);
  const pathname = usePathname();
  const { changed } = useCartSync(isOpen);

  // Close when navigating to another page.
  useEffect(() => {
    close();
  }, [pathname, close]);

  const count = cartCount(lines);
  const subtotal = cartSubtotal(lines);
  const blocked = hasBlockingIssues(lines);

  return (
    <Sheet open={isOpen} onClose={close} title={`Your bag${hydrated && count ? ` (${count})` : ""}`}>
      {!hydrated || lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <ShoppingBag className="size-10 text-ash" strokeWidth={1.2} />
          <div>
            <p className="font-display text-lg font-semibold uppercase tracking-[0.15em]">Your bag is empty</p>
            <p className="mt-2 text-sm text-mist">Find something that moves like you do.</p>
          </div>
          <Link href="/shop" onClick={close} className={buttonClass({ variant: "light" })}>
            Shop the drop
          </Link>
        </div>
      ) : (
        <>
          <div className="border-b border-line px-5 py-4">
            <FreeShippingMeter subtotal={subtotal} />
          </div>
          {changed && (
            <p className="border-b border-line bg-blood/10 px-5 py-2.5 text-xs text-bone">
              Some prices or stock levels changed since you added them. Your bag has been updated.
            </p>
          )}
          <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5">
            {lines.map((line) => (
              <CartLineItem key={line.variantId} line={line} onNavigate={close} />
            ))}
          </ul>
          <div className="space-y-4 border-t border-line px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Subtotal</span>
              <span className="font-display text-lg font-semibold tabular-nums">{formatINR(subtotal)}</span>
            </div>
            <p className="text-xs text-mist">Shipping and discounts are calculated at checkout. Prices include GST.</p>
            {blocked ? (
              <p className="text-xs text-blood">Remove sold-out items to continue.</p>
            ) : null}
            <div className="grid gap-2">
              <Link
                href="/checkout"
                onClick={close}
                aria-disabled={blocked}
                className={buttonClass({ block: true, size: "lg", className: blocked ? "pointer-events-none opacity-50" : "" })}
              >
                Checkout · {formatINR(subtotal)}
              </Link>
              <Link href="/cart" onClick={close} className={buttonClass({ variant: "outline", block: true })}>
                View bag
              </Link>
            </div>
          </div>
        </>
      )}
    </Sheet>
  );
}
