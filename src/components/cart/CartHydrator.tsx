"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/** Loads the saved bag from localStorage after mount and keeps tabs in sync. */
export function CartHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "rb-cart") void useCart.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
