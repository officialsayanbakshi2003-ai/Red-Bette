import { describe, expect, it } from "vitest";
import { addressSchema, checkoutSchema, passwordSchema, phoneSchema, productInputSchema, registerSchema } from "@/lib/validators";

describe("phoneSchema", () => {
  it("normalises Indian mobile numbers", () => {
    expect(phoneSchema.parse("+91 98765 43210")).toBe("9876543210");
    expect(phoneSchema.parse("09876543210")).toBe("9876543210");
    expect(phoneSchema.parse("919876543210")).toBe("9876543210");
  });
  it("rejects invalid numbers", () => {
    expect(phoneSchema.safeParse("12345").success).toBe(false);
    expect(phoneSchema.safeParse("5876543210").success).toBe(false);
  });
});

describe("addressSchema", () => {
  const valid = {
    fullName: "Aarav Sharma",
    phone: "9876543210",
    line1: "221B Park Street",
    city: "Kolkata",
    state: "West Bengal",
    postalCode: "700016",
  };
  it("accepts a valid address", () => {
    expect(addressSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects bad PIN codes and unknown states", () => {
    expect(addressSchema.safeParse({ ...valid, postalCode: "012345" }).success).toBe(false);
    expect(addressSchema.safeParse({ ...valid, state: "Atlantis" }).success).toBe(false);
  });
});

describe("auth schemas", () => {
  it("requires a reasonably strong password", () => {
    expect(passwordSchema.safeParse("short1").success).toBe(false);
    expect(passwordSchema.safeParse("onlyletters").success).toBe(false);
    expect(passwordSchema.safeParse("flowyourway1").success).toBe(true);
  });
  it("normalises email case", () => {
    const r = registerSchema.parse({ name: "Riya", email: "  Riya@Example.COM ", password: "flowyourway1" });
    expect(r.email).toBe("riya@example.com");
  });
});

describe("checkoutSchema", () => {
  const base = {
    email: "a@b.co",
    address: { fullName: "A B", phone: "9876543210", line1: "12 MG Road", city: "Pune", state: "Maharashtra", postalCode: "411001" },
    items: [{ variantId: "v1", quantity: 1 }],
    paymentMethod: "COD",
  };
  it("accepts a valid payload and uppercases coupon codes", () => {
    const r = checkoutSchema.parse({ ...base, couponCode: " welcome10 " });
    expect(r.couponCode).toBe("WELCOME10");
  });
  it("rejects empty bags, silly quantities and unknown payment methods", () => {
    expect(checkoutSchema.safeParse({ ...base, items: [] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, items: [{ variantId: "v1", quantity: 0 }] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, items: [{ variantId: "v1", quantity: 99 }] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, paymentMethod: "CRYPTO" }).success).toBe(false);
  });
  it("ignores any client-sent prices", () => {
    const r = checkoutSchema.parse({ ...base, items: [{ variantId: "v1", quantity: 1, unitPrice: 1 }] });
    expect(r.items[0]).toEqual({ variantId: "v1", quantity: 1 });
  });
});

describe("productInputSchema", () => {
  const product = {
    name: "Test Hoodie",
    slug: "test-hoodie",
    description: "A great hoodie for testing.",
    details: [],
    price: 1999_00,
    compareAtPrice: null,
    categoryId: "c1",
    images: ["/products/x.svg"],
    tags: [],
    isFeatured: false,
    isActive: true,
    variants: [{ size: "M", color: "Black", sku: "RB-T-M", stock: 5 }],
  };
  it("accepts a valid product", () => {
    expect(productInputSchema.safeParse(product).success).toBe(true);
  });
  it("rejects duplicate size/colour combos and SKUs", () => {
    const dupes = { ...product, variants: [...product.variants, { size: "M", color: "black", sku: "RB-T-M2", stock: 1 }] };
    expect(productInputSchema.safeParse(dupes).success).toBe(false);
    const dupeSku = { ...product, variants: [...product.variants, { size: "L", color: "Black", sku: "RB-T-M", stock: 1 }] };
    expect(productInputSchema.safeParse(dupeSku).success).toBe(false);
  });
  it("rejects javascript: and http image URLs", () => {
    expect(productInputSchema.safeParse({ ...product, images: ["javascript:alert(1)"] }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...product, images: ["http://insecure.example/x.jpg"] }).success).toBe(false);
  });
  it("rejects a compare-at price below the selling price", () => {
    expect(productInputSchema.safeParse({ ...product, compareAtPrice: 1000_00 }).success).toBe(false);
  });
});
