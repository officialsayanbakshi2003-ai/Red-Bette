"use client";

import { clsx } from "clsx";
import { Ruler, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { buttonClass } from "@/components/ui/button";
import { commerce, sizeLabel } from "@/lib/config";
import { formatINR } from "@/lib/money";
import { useCart } from "@/store/cart";
import { SizeTable, type SIZE_CHART } from "./SizeGuide";
import { WishlistButton } from "./WishlistButton";

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

export function ProductPurchase({
  product,
  variants,
  wishlisted,
  sizeChart,
}: {
  product: { id: string; slug: string; name: string; price: number; image: string | null };
  variants: Variant[];
  wishlisted: boolean;
  sizeChart: (typeof SIZE_CHART)[keyof typeof SIZE_CHART] | null;
}) {
  const colors = useMemo(() => [...new Set(variants.map((v) => v.color))], [variants]);
  const [color, setColor] = useState(colors[0] ?? "");
  const forColor = variants.filter((v) => v.color === color);
  const isOneSize = forColor.length === 1 && forColor[0]!.size === "OS";
  const [variantId, setVariantId] = useState<string | null>(isOneSize ? forColor[0]!.id : null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const add = useCart((s) => s.add);

  const selected = forColor.find((v) => v.id === variantId) ?? null;
  const allSoldOut = forColor.every((v) => v.stock <= 0);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setShowSticky(!entry!.isIntersecting && entry!.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onAdd = () => {
    if (!selected) {
      setError("Please select a size.");
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (selected.stock <= 0) {
      setError("This size is sold out.");
      return;
    }
    setError(null);
    add(
      {
        variantId: selected.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        size: selected.size,
        color: selected.color,
        unitPrice: product.price,
        maxQuantity: selected.stock,
      },
      1,
    );
  };

  return (
    <div>
      {colors.length > 1 && (
        <div className="mb-6">
          <p className="eyebrow mb-3">
            Colour: <span className="text-bone">{color}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  setVariantId(null);
                }}
                aria-pressed={c === color}
                className={clsx(
                  "h-10 border px-4 text-xs",
                  c === color ? "border-bone text-bone" : "border-line text-mist hover:border-bone/60",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      {colors.length === 1 && (
        <p className="eyebrow mb-5">
          Colour: <span className="text-bone">{color}</span>
        </p>
      )}

      {!isOneSize && (
        <div id="size-picker" className="scroll-mt-28">
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">
              Size{selected && <span className="text-bone">: {sizeLabel(selected.size)}</span>}
            </p>
            {sizeChart && (
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="flex items-center gap-1.5 text-xs text-mist underline-offset-4 hover:text-bone hover:underline"
              >
                <Ruler className="size-3.5" /> Size guide
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 xs:grid-cols-6" role="radiogroup" aria-label="Select size">
            {forColor.map((v) => {
              const soldOut = v.stock <= 0;
              const active = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={soldOut}
                  onClick={() => {
                    setVariantId(v.id);
                    setError(null);
                  }}
                  className={clsx(
                    "relative h-12 border text-sm font-medium transition-colors",
                    active && "border-bone bg-bone text-ink",
                    !active && !soldOut && "border-line hover:border-bone",
                    soldOut && "cursor-not-allowed border-line text-ash",
                  )}
                  aria-label={`${sizeLabel(v.size)}${soldOut ? ", sold out" : ""}`}
                >
                  {sizeLabel(v.size)}
                  {soldOut && (
                    <span className="absolute inset-0 bg-[linear-gradient(to_top_right,transparent_calc(50%-0.5px),#3a3a42_50%,transparent_calc(50%+0.5px))]" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-3 min-h-5 text-xs" aria-live="polite">
            {error ? (
              <span className="text-blood">{error}</span>
            ) : selected && selected.stock > 0 && selected.stock <= 5 ? (
              <span className="text-blood">Hurry, only {selected.stock} left in this size.</span>
            ) : selected ? (
              <span className="text-emerald-600">In stock, ready to ship.</span>
            ) : null}
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          ref={buttonRef}
          type="button"
          onClick={onAdd}
          disabled={allSoldOut}
          className={buttonClass({ size: "lg", className: "h-14 min-w-0 flex-1 px-4 sm:px-8" })}
        >
          <ShoppingBag className="size-4 shrink-0" />
          {allSoldOut ? (
            "Sold out"
          ) : (
            <>
              Add to bag<span className="hidden xs:inline"> · {formatINR(product.price)}</span>
            </>
          )}
        </button>
        <WishlistButton productId={product.id} initial={wishlisted} variant="full" />
      </div>

      <ul className="mt-6 space-y-2.5 text-sm text-mist">
        <li className="flex items-center gap-3">
          <Truck className="size-4 shrink-0 text-bone" />
          {product.price >= commerce.freeShippingThreshold
            ? "Free shipping · Delivered in 3 to 7 working days"
            : `Free shipping over ${formatINR(commerce.freeShippingThreshold)} · Delivered in 3 to 7 working days`}
        </li>
      </ul>

      {/* Sticky add-to-bag on mobile once the main button scrolls away */}
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 px-4 py-3 backdrop-blur transition-transform duration-300 lg:hidden",
          showSticky ? "translate-y-0" : "translate-y-full",
        )}
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        aria-hidden={!showSticky}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold">{product.name}</p>
            <p className="text-xs text-mist">
              {formatINR(product.price)}
              {selected ? ` · ${sizeLabel(selected.size)}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={allSoldOut}
            tabIndex={showSticky ? 0 : -1}
            className={buttonClass({ size: "md" })}
          >
            {allSoldOut ? "Sold out" : selected ? "Add to bag" : "Select size"}
          </button>
        </div>
      </div>

      {sizeChart && (
        <Sheet open={guideOpen} onClose={() => setGuideOpen(false)} title="Size guide">
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
            <p className="text-sm text-mist">
              Measurements are of the garment laid flat, in inches. Our fits are oversized. For a regular fit, size
              down one.
            </p>
            <SizeTable chart={sizeChart} />
          </div>
        </Sheet>
      )}
    </div>
  );
}
