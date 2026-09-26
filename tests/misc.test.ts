import { describe, expect, it } from "vitest";
import { signSession, verifySession } from "@/lib/auth/token";
import { discountPercent, formatINR } from "@/lib/money";
import { parseShopParams, shopHref } from "@/lib/shop-params";
import { sniffImageType } from "@/lib/storage";

process.env.AUTH_SECRET = "x".repeat(48);

describe("formatINR", () => {
  it("formats rupees in the Indian system", () => {
    expect(formatINR(1999_00)).toBe("₹1,999");
    expect(formatINR(1_00_000_00)).toBe("₹1,00,000");
    expect(formatINR(2249_10)).toBe("₹2,249.10");
  });
  it("computes discount percentages", () => {
    expect(discountPercent(2499_00, 2999_00)).toBe(17);
    expect(discountPercent(2499_00, null)).toBeNull();
    expect(discountPercent(2499_00, 2000_00)).toBeNull();
  });
});

describe("shop params", () => {
  it("sanitises untrusted query strings", () => {
    const p = parseShopParams({ category: "hoodies", size: "m,xl,HACK", sort: "evil", page: "-4", price: "2000-plus", tag: "<script>" });
    expect(p).toMatchObject({ category: "hoodies", sizes: ["M", "XL"], sort: "featured", page: 1, price: "2000-plus", tag: undefined });
  });
  it("builds canonical URLs and resets the page on filter changes", () => {
    const p = parseShopParams({ category: "hoodies", page: "3" });
    expect(shopHref(p, { sizes: ["M"] })).toBe("/shop?category=hoodies&size=M");
    expect(shopHref(p, { page: 2 })).toBe("/shop?category=hoodies&page=2");
  });
});

describe("session tokens", () => {
  it("round-trips and rejects tampering", async () => {
    const token = await signSession({ sub: "user_1", role: "CUSTOMER", ver: 0 });
    expect(await verifySession(token)).toEqual({ sub: "user_1", role: "CUSTOMER", ver: 0 });
    const [h, payload, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload!, "base64url").toString()), role: "ADMIN" })).toString("base64url");
    expect(await verifySession(`${h}.${forged}.${sig}`)).toBeNull();
    expect(await verifySession("garbage")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });
});

describe("upload sniffing", () => {
  it("detects real image types from bytes, not names", () => {
    expect(sniffImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]))?.ext).toBe("jpg");
    expect(sniffImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.ext).toBe("png");
    expect(sniffImageType(Buffer.from("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImageType(Buffer.from("<?php echo 1; ?>"))).toBeNull();
  });
});
