const wholeRupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const withPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats an amount in paise as Indian Rupees, e.g. 199900 → "₹1,999". */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return Number.isInteger(rupees) ? wholeRupees.format(rupees) : withPaise.format(rupees);
}

/** Converts a rupee amount typed by a person (e.g. "1999.50") into paise. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function discountPercent(price: number, compareAtPrice?: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
