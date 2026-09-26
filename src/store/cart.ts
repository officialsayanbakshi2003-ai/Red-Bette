"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { commerce } from "@/lib/config";

export interface CartLine {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  color: string;
  unitPrice: number; // paise, display only; the server re-prices at checkout
  quantity: number;
  maxQuantity: number; // stock at the time it was added
}

interface CartState {
  lines: CartLine[];
  couponCode: string | null;
  isOpen: boolean;
  hydrated: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setCoupon: (code: string | null) => void;
  open: () => void;
  close: () => void;
  replaceLines: (lines: CartLine[]) => void;
  setHydrated: () => void;
}

const clampQty = (qty: number, max: number) =>
  Math.max(1, Math.min(Math.floor(qty) || 1, Math.max(1, Math.min(max, commerce.maxQtyPerLine))));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      couponCode: null,
      isOpen: false,
      hydrated: false,
      add: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === line.variantId);
          if (existing) {
            return {
              isOpen: true,
              lines: state.lines.map((l) =>
                l.variantId === line.variantId
                  ? { ...l, ...line, quantity: clampQty(l.quantity + quantity, line.maxQuantity) }
                  : l,
              ),
            };
          }
          if (state.lines.length >= commerce.maxLinesPerOrder) return state;
          return {
            isOpen: true,
            lines: [...state.lines, { ...line, quantity: clampQty(quantity, line.maxQuantity) }],
          };
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.variantId === variantId ? { ...l, quantity: clampQty(quantity, l.maxQuantity) } : l,
          ),
        })),
      remove: (variantId) => set((state) => ({ lines: state.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [], couponCode: null }),
      setCoupon: (code) => set({ couponCode: code }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      replaceLines: (lines) => set({ lines }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "rb-cart",
      version: 1,
      // Never write before the saved bag has been loaded, or an early state
      // change (e.g. closing the drawer on navigation) would wipe it.
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(name),
        setItem: (name, value) => {
          if (useCart.getState().hydrated) localStorage.setItem(name, value);
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
      partialize: (state) => ({ lines: state.lines, couponCode: state.couponCode }),
      // Rehydrated by <CartHydrator /> after mount so server and client first renders match.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
