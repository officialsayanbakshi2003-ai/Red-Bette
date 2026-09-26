import type { Prisma } from "@/generated/prisma/client";

export const SORTS = {
  featured: { label: "Featured", orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }] },
  newest: { label: "Newest", orderBy: [{ createdAt: "desc" }] },
  "price-asc": { label: "Price: low to high", orderBy: [{ price: "asc" }] },
  "price-desc": { label: "Price: high to low", orderBy: [{ price: "desc" }] },
} as const satisfies Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput[] }>;
export type SortKey = keyof typeof SORTS;

export const PRICE_RANGES = {
  "under-1000": { label: "Under ₹1,000", min: 0, max: 999_99 },
  "1000-2000": { label: "₹1,000 to ₹2,000", min: 1000_00, max: 1999_99 },
  "2000-plus": { label: "₹2,000 & above", min: 2000_00, max: undefined },
} as const;
export type PriceRangeKey = keyof typeof PRICE_RANGES;
