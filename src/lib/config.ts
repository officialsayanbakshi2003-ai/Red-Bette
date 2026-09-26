// Store-wide settings. Money values are in paise (₹1 = 100 paise).

export const siteConfig = {
  name: "Red Betta",
  tagline: "Flow Your Way.",
  parentBrand: "RetailJinny",
  parentLine: "From the House of RetailJinny",
  description:
    "Red Betta is premium Indian streetwear. Heavyweight hoodies and tees with bold, hand-crafted art. Flow your way.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  supportEmail: "support@redbetta.in",
  supportPhone: "+91 98765 43210",
  instagram: "https://instagram.com/redbetta",
  address: "Kolkata, West Bengal, India",
} as const;

export const commerce = {
  currency: "INR",
  freeShippingThreshold: 1999_00,
  shippingFee: 99_00,
  codFee: 49_00,
  // Cash on delivery is only offered up to this order value.
  codMaxOrderValue: 10000_00,
  maxQtyPerLine: 10,
  maxLinesPerOrder: 30,
  // Unpaid online orders release their reserved stock after this many minutes.
  pendingOrderTtlMinutes: 30,
  returnWindowDays: 7,
} as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "OS"] as const;
export type Size = (typeof SIZES)[number];

export const sizeLabel = (size: string) => (size === "OS" ? "One size" : size);
export const sizeRank = (size: string) => {
  const i = (SIZES as readonly string[]).indexOf(size);
  return i === -1 ? SIZES.length : i;
};
