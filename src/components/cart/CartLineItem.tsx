"use client";

import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { sizeLabel } from "@/lib/config";
import { formatINR } from "@/lib/money";
import { useCart, type CartLine } from "@/store/cart";

export function CartLineItem({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const soldOut = line.maxQuantity <= 0;
  const max = Math.min(line.maxQuantity, 10);

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/products/${line.slug}`}
        onClick={onNavigate}
        className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-char sm:w-28"
      >
        <ProductImage src={line.image} alt={line.name} fill sizes="112px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${line.slug}`}
              onClick={onNavigate}
              className="line-clamp-2 font-display text-sm font-medium tracking-wide hover:text-blood"
            >
              {line.name}
            </Link>
            <p className="mt-1 text-xs text-mist">
              {line.color} · {sizeLabel(line.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => remove(line.variantId)}
            className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center text-mist hover:text-bone"
            aria-label={`Remove ${line.name} from bag`}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          {soldOut ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-blood">Sold out. Please remove</p>
          ) : (
            <div className="flex h-9 items-center border border-line">
              <button
                type="button"
                onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                disabled={line.quantity <= 1}
                className="grid h-full w-9 place-items-center text-mist hover:text-bone disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
                {line.quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                disabled={line.quantity >= max}
                className="grid h-full w-9 place-items-center text-mist hover:text-bone disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          )}
          <p className="font-display text-sm font-semibold tabular-nums">{formatINR(line.unitPrice * line.quantity)}</p>
        </div>
        {!soldOut && line.quantity >= line.maxQuantity && line.maxQuantity < 10 && (
          <p className="mt-2 text-[0.7rem] text-mist">Only {line.maxQuantity} left in this size.</p>
        )}
      </div>
    </li>
  );
}
