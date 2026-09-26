import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { sizeRank } from "./config";
import { PRICE_RANGES, SORTS, type PriceRangeKey, type SortKey } from "./catalog-constants";

export { PRICE_RANGES, SORTS, type PriceRangeKey, type SortKey };

export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  price: true,
  compareAtPrice: true,
  images: true,
  tags: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  variants: { select: { id: true, size: true, color: true, stock: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export interface ProductQuery {
  category?: string;
  sizes?: string[];
  price?: PriceRangeKey;
  q?: string;
  sort?: SortKey;
  tag?: string;
  page?: number;
  perPage?: number;
}

export async function listProducts(query: ProductQuery) {
  const perPage = query.perPage ?? 12;
  const page = Math.max(1, query.page ?? 1);
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (query.category) where.category = { slug: query.category };
  if (query.tag) where.tags = { has: query.tag };
  if (query.sizes?.length) where.variants = { some: { size: { in: query.sizes }, stock: { gt: 0 } } };
  if (query.price) {
    const range = PRICE_RANGES[query.price];
    where.price = { gte: range.min, ...(range.max != null ? { lte: range.max } : {}) };
  }
  if (query.q) {
    const q = query.q.slice(0, 80);
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  const sort = SORTS[query.sort ?? "featured"] ?? SORTS.featured;
  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: [...sort.orderBy, { id: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      select: productCardSelect,
    }),
  ]);
  return { products, total, page, pageCount: Math.max(1, Math.ceil(total / perPage)) };
}

export const getCategories = cache(async () =>
  db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  }),
);

export async function getFeaturedProducts(take = 8) {
  return db.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take,
    select: productCardSelect,
  });
}

export async function getProductsByTag(tag: string, take = 8) {
  return db.product.findMany({
    where: { isActive: true, tags: { has: tag } },
    orderBy: { createdAt: "desc" },
    take,
    select: productCardSelect,
  });
}

export const getProductBySlug = cache(async (slug: string) => {
  const product = await db.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true } } },
      },
      _count: { select: { reviews: true } },
    },
  });
  if (!product) return null;
  product.variants.sort((a, b) => sizeRank(a.size) - sizeRank(b.size));
  const agg = await db.review.aggregate({ where: { productId: product.id }, _avg: { rating: true } });
  return { ...product, averageRating: agg._avg.rating ?? null };
});

export async function getRelatedProducts(productId: string, categoryId: string, take = 4) {
  const sameCategory = await db.product.findMany({
    where: { isActive: true, categoryId, id: { not: productId } },
    orderBy: { isFeatured: "desc" },
    take,
    select: productCardSelect,
  });
  if (sameCategory.length >= take) return sameCategory;
  const others = await db.product.findMany({
    where: { isActive: true, id: { notIn: [productId, ...sameCategory.map((p) => p.id)] } },
    orderBy: { isFeatured: "desc" },
    take: take - sameCategory.length,
    select: productCardSelect,
  });
  return [...sameCategory, ...others];
}

export function totalStock(variants: { stock: number }[]) {
  return variants.reduce((n, v) => n + v.stock, 0);
}

/** Product ids the signed-in shopper has saved, for rendering filled hearts. */
export async function getWishlistIds(userId: string | null | undefined): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await db.wishlistItem.findMany({ where: { userId }, select: { productId: true } });
  return new Set(rows.map((r) => r.productId));
}
