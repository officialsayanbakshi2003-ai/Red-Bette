import { PRICE_RANGES, SORTS, type PriceRangeKey, type SortKey } from "./catalog-constants";
import { SIZES } from "./config";

export interface ShopParams {
  category?: string;
  sizes: string[];
  price?: PriceRangeKey;
  sort: SortKey;
  q?: string;
  tag?: string;
  page: number;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Parses and sanitises untrusted query-string values for the shop page. */
export function parseShopParams(raw: RawParams): ShopParams {
  const category = first(raw.category)?.slice(0, 60);
  const tag = first(raw.tag)?.slice(0, 40);
  const q = first(raw.q)?.trim().slice(0, 80) || undefined;
  const sizes = (first(raw.size) ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s): s is (typeof SIZES)[number] => (SIZES as readonly string[]).includes(s));
  const priceRaw = first(raw.price);
  const price = priceRaw && priceRaw in PRICE_RANGES ? (priceRaw as PriceRangeKey) : undefined;
  const sortRaw = first(raw.sort);
  const sort = sortRaw && sortRaw in SORTS ? (sortRaw as SortKey) : "featured";
  const page = Math.min(500, Math.max(1, Number.parseInt(first(raw.page) ?? "1", 10) || 1));
  return {
    category: category && /^[a-z0-9-]+$/.test(category) ? category : undefined,
    tag: tag && /^[a-z0-9-]+$/.test(tag) ? tag : undefined,
    q,
    sizes: [...new Set(sizes)],
    price,
    sort,
    page,
  };
}

/** Builds a /shop URL from the current params plus changes (page resets unless given). */
export function shopHref(current: ShopParams, changes: Partial<ShopParams>): string {
  const next = { ...current, page: 1, ...changes };
  const sp = new URLSearchParams();
  if (next.category) sp.set("category", next.category);
  if (next.tag) sp.set("tag", next.tag);
  if (next.q) sp.set("q", next.q);
  if (next.sizes.length) sp.set("size", next.sizes.join(","));
  if (next.price) sp.set("price", next.price);
  if (next.sort && next.sort !== "featured") sp.set("sort", next.sort);
  if (next.page > 1) sp.set("page", String(next.page));
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}
