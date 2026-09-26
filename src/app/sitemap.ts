import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const [products, categories] = await Promise.all([
    db.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ select: { slug: true } }),
  ]);
  const staticPages = ["", "/shop", "/about", "/contact", "/faq", "/shipping-returns", "/size-guide", "/privacy-policy", "/terms"];
  return [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: path === "" || path === "/shop" ? ("daily" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.4,
    })),
    ...categories.map((c) => ({ url: `${base}/shop?category=${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
