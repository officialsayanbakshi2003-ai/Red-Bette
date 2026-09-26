"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCart, type CartLine } from "@/store/cart";

interface LiveItem {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  color: string;
  unitPrice: number;
  stock: number;
}

/**
 * Refreshes the saved bag against live prices and stock. Lines whose variant
 * no longer exists are dropped; sold-out lines stay visible but block checkout.
 */
export function useCartSync(enabled = true) {
  const hydrated = useCart((s) => s.hydrated);
  const [syncing, setSyncing] = useState(false);
  const [changed, setChanged] = useState(false);
  const inFlight = useRef(false);

  const sync = useCallback(async () => {
    const { lines, replaceLines } = useCart.getState();
    if (lines.length === 0 || inFlight.current) return;
    inFlight.current = true;
    setSyncing(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantIds: lines.map((l) => l.variantId) }),
      });
      if (!res.ok) return;
      const { items } = (await res.json()) as { items: LiveItem[] };
      const byId = new Map(items.map((i) => [i.variantId, i]));
      let didChange = false;
      const current = useCart.getState().lines;
      const next: CartLine[] = [];
      for (const line of current) {
        const live = byId.get(line.variantId);
        if (!live) {
          didChange = true;
          continue;
        }
        const quantity = live.stock > 0 ? Math.min(line.quantity, live.stock) : line.quantity;
        if (
          live.unitPrice !== line.unitPrice ||
          quantity !== line.quantity ||
          (live.stock === 0 && line.maxQuantity !== 0)
        ) {
          didChange = true;
        }
        next.push({
          ...line,
          name: live.name,
          slug: live.slug,
          image: live.image,
          unitPrice: live.unitPrice,
          maxQuantity: live.stock,
          quantity,
        });
      }
      replaceLines(next);
      setChanged(didChange);
    } catch {
      // Offline or server hiccup: keep the saved bag as-is.
    } finally {
      inFlight.current = false;
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !hydrated) return;
    const timer = setTimeout(() => void sync(), 0);
    return () => clearTimeout(timer);
  }, [enabled, hydrated, sync]);

  return { syncing, changed, sync };
}

export const hasBlockingIssues = (lines: CartLine[]) =>
  lines.some((l) => l.maxQuantity <= 0 || l.quantity > l.maxQuantity);
