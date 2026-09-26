"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/** Empties the bag once an order is confirmed (covers payments completed on the order page). */
export function ClearCartOnMount() {
  const hydrated = useCart((s) => s.hydrated);
  useEffect(() => {
    if (hydrated) useCart.getState().clear();
  }, [hydrated]);
  return null;
}
