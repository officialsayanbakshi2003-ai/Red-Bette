"use client";

import { clsx } from "clsx";
import { sizeLabel, sizeRank } from "@/lib/config";
import { useCart } from "@/store/cart";

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

/** Hover bar on product cards (desktop): pick a size and add straight to the bag. */
export function QuickAdd({
  product,
  variants,
}: {
  product: { id: string; slug: string; name: string; price: number; image: string | null };
  variants: Variant[];
}) {
  const add = useCart((s) => s.add);
  const sorted = [...variants].sort((a, b) => sizeRank(a.size) - sizeRank(b.size));
  if (sorted.every((v) => v.stock <= 0)) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-ink/95 px-3 py-3 backdrop-blur transition-transform duration-300 group-focus-within:translate-y-0 group-hover:translate-y-0 md:block">
      <p className="mb-2 font-display text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-mist">Quick add</p>
      <div className="flex flex-wrap gap-1.5">
        {sorted.map((v) => {
          const soldOut = v.stock <= 0;
          return (
            <button
              key={v.id}
              type="button"
              disabled={soldOut}
              onClick={() =>
                add({
                  variantId: v.id,
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: product.image,
                  size: v.size,
                  color: v.color,
                  unitPrice: product.price,
                  maxQuantity: v.stock,
                })
              }
              aria-label={`Add ${product.name}, size ${sizeLabel(v.size)}, to bag`}
              className={clsx(
                "h-8 min-w-10 border px-2 text-xs font-semibold transition-colors",
                soldOut
                  ? "cursor-not-allowed border-line text-ash line-through"
                  : "border-line hover:border-bone hover:bg-bone hover:text-ink",
              )}
            >
              {sizeLabel(v.size)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
