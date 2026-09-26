import { X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterDrawer } from "@/components/shop/FilterDrawer";
import { FilterPanel } from "@/components/shop/FilterPanel";
import { SortSelect } from "@/components/shop/SortSelect";
import { buttonClass } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories, getWishlistIds, listProducts, PRICE_RANGES, SORTS, type SortKey } from "@/lib/catalog";
import { sizeLabel } from "@/lib/config";
import { parseShopParams, shopHref } from "@/lib/shop-params";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const TAG_TITLES: Record<string, string> = {
  new: "New arrivals",
  bestseller: "Bestsellers",
  limited: "Limited edition",
  betta: "The Betta series",
  essential: "Essentials",
  mountains: "The Summit series",
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = parseShopParams(await searchParams);
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === params.category);
  const title = params.q
    ? `Search: ${params.q}`
    : category?.name ?? (params.tag ? TAG_TITLES[params.tag] : undefined) ?? "Shop all";
  return {
    title,
    description: category?.description ?? "Shop premium Red Betta streetwear: heavyweight hoodies, oversized tees and more.",
    alternates: { canonical: shopHref({ ...params, sizes: [], price: undefined, sort: "featured", page: 1 }, {}) },
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const params = parseShopParams(await searchParams);
  const [categories, user] = await Promise.all([getCategories(), getCurrentUser()]);
  const [{ products, total, page, pageCount }, wishlist] = await Promise.all([
    listProducts({ ...params, perPage: 12 }),
    getWishlistIds(user?.id),
  ]);

  const category = categories.find((c) => c.slug === params.category);
  const title = params.q
    ? `“${params.q}”`
    : category?.name ?? (params.tag ? TAG_TITLES[params.tag] ?? "Shop" : "Shop all");
  const description = params.q
    ? `${total} result${total === 1 ? "" : "s"} for your search`
    : category?.description ?? "Heavyweight streetwear with art that refuses to sit still.";

  const catOptions = categories.map((c) => ({ name: c.name, slug: c.slug, count: c._count.products }));
  const chips: { label: string; href: string }[] = [
    ...(params.q ? [{ label: `Search: ${params.q}`, href: shopHref(params, { q: undefined }) }] : []),
    ...(params.tag ? [{ label: TAG_TITLES[params.tag] ?? params.tag, href: shopHref(params, { tag: undefined }) }] : []),
    ...(category ? [{ label: category.name, href: shopHref(params, { category: undefined }) }] : []),
    ...params.sizes.map((s) => ({
      label: `Size ${sizeLabel(s)}`,
      href: shopHref(params, { sizes: params.sizes.filter((x) => x !== s) }),
    })),
    ...(params.price ? [{ label: PRICE_RANGES[params.price].label, href: shopHref(params, { price: undefined }) }] : []),
  ];
  const filterCount = params.sizes.length + (params.price ? 1 : 0) + (params.category ? 1 : 0);
  const sortHrefs = Object.fromEntries(
    (Object.keys(SORTS) as SortKey[]).map((k) => [k, shopHref(params, { sort: k })]),
  ) as Record<SortKey, string>;

  return (
    <div className="container-x pb-8 pt-8 sm:pt-12">
      <nav aria-label="Breadcrumb" className="text-xs text-ash">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-bone">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/shop" className="hover:text-bone">Shop</Link></li>
          {category && (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-mist">{category.name}</li>
            </>
          )}
        </ol>
      </nav>

      <header className="mt-6 flex flex-col gap-3 sm:mt-8">
        <h1 className="display text-5xl sm:text-7xl">{title}</h1>
        <p className="max-w-xl text-sm text-mist sm:text-base">{description}</p>
      </header>

      {/* Category pills */}
      <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:hidden">
        <Link
          href={shopHref(params, { category: undefined })}
          className={
            "shrink-0 border px-4 py-2 font-display text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-colors " +
            (!params.category ? "border-bone bg-bone text-ink" : "border-line text-mist hover:border-bone/60 hover:text-bone")
          }
        >
          All
        </Link>
        {catOptions.map((c) => (
          <Link
            key={c.slug}
            href={shopHref(params, { category: c.slug })}
            className={
              "shrink-0 border px-4 py-2 font-display text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-colors " +
              (params.category === c.slug
                ? "border-bone bg-bone text-ink"
                : "border-line text-mist hover:border-bone/60 hover:text-bone")
            }
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24">
            <FilterPanel params={params} categories={catOptions} />
          </div>
        </aside>

        <section aria-label="Products">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <FilterDrawer activeCount={filterCount}>
                  <FilterPanel params={params} categories={catOptions} />
                </FilterDrawer>
              </div>
              <p className="text-xs text-mist">
                {total} product{total === 1 ? "" : "s"}
              </p>
            </div>
            <SortSelect value={params.sort} hrefs={sortHrefs} />
          </div>

          {chips.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  scroll={false}
                  className="flex items-center gap-1.5 bg-smoke px-3 py-1.5 text-xs text-bone hover:bg-line"
                >
                  {chip.label} <X className="size-3" aria-label="remove" />
                </Link>
              ))}
            </div>
          )}

          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-5 border border-dashed border-line px-6 py-20 text-center">
              <p className="display text-3xl">Nothing here… yet.</p>
              <p className="max-w-sm text-sm text-mist">
                No products match these filters. Try removing a filter or searching for something else.
              </p>
              <Link href="/shop" className={buttonClass({ variant: "light" })}>
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wishlisted={wishlist.has(p.id)}
                  priority={i < 3}
                  sizes="(min-width: 1024px) 28vw, (min-width: 768px) 33vw, 50vw"
                />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
              {page > 1 && (
                <Link href={shopHref(params, { page: page - 1 })} className="grid h-10 place-items-center border border-line px-4 text-xs hover:border-bone">
                  Prev
                </Link>
              )}
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={shopHref(params, { page: n })}
                  aria-current={n === page ? "page" : undefined}
                  className={
                    "grid size-10 place-items-center border text-xs " +
                    (n === page ? "border-bone bg-bone text-ink" : "border-line hover:border-bone")
                  }
                >
                  {n}
                </Link>
              ))}
              {page < pageCount && (
                <Link href={shopHref(params, { page: page + 1 })} className="grid h-10 place-items-center border border-line px-4 text-xs hover:border-bone">
                  Next
                </Link>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
