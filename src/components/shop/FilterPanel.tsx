import { clsx } from "clsx";
import { Check } from "lucide-react";
import Link from "next/link";
import { PRICE_RANGES, type PriceRangeKey } from "@/lib/catalog-constants";
import { SIZES, sizeLabel } from "@/lib/config";
import { shopHref, type ShopParams } from "@/lib/shop-params";

function Option({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={clsx(
        "flex items-center justify-between py-2 text-sm transition-colors",
        active ? "text-bone" : "text-mist hover:text-bone",
      )}
    >
      {children}
      <span
        className={clsx(
          "grid size-4 place-items-center border",
          active ? "border-blood bg-blood text-white" : "border-line",
        )}
      >
        {active && <Check className="size-3" strokeWidth={3} />}
      </span>
    </Link>
  );
}

export function FilterPanel({
  params,
  categories,
}: {
  params: ShopParams;
  categories: { name: string; slug: string; count: number }[];
}) {
  const toggleSize = (size: string) =>
    params.sizes.includes(size) ? params.sizes.filter((s) => s !== size) : [...params.sizes, size];

  return (
    <div className="space-y-8">
      <section>
        <h3 className="eyebrow mb-3">Category</h3>
        <Option href={shopHref(params, { category: undefined })} active={!params.category}>
          All products
        </Option>
        {categories.map((c) => (
          <Option key={c.slug} href={shopHref(params, { category: c.slug })} active={params.category === c.slug}>
            <span>
              {c.name} <span className="text-ash">({c.count})</span>
            </span>
          </Option>
        ))}
      </section>

      <section>
        <h3 className="eyebrow mb-3">Size</h3>
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((size) => {
            const active = params.sizes.includes(size);
            return (
              <Link
                key={size}
                href={shopHref(params, { sizes: toggleSize(size) })}
                scroll={false}
                aria-current={active ? "true" : undefined}
                className={clsx(
                  "grid h-10 place-items-center border text-xs font-medium transition-colors",
                  active ? "border-bone bg-bone text-ink" : "border-line text-mist hover:border-bone/60 hover:text-bone",
                  size === "OS" && "col-span-2",
                )}
              >
                {sizeLabel(size)}
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="eyebrow mb-3">Price</h3>
        {(Object.keys(PRICE_RANGES) as PriceRangeKey[]).map((key) => (
          <Option
            key={key}
            href={shopHref(params, { price: params.price === key ? undefined : key })}
            active={params.price === key}
          >
            {PRICE_RANGES[key].label}
          </Option>
        ))}
      </section>

      <Link
        href="/shop"
        className="block border border-line py-3 text-center font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-mist hover:border-bone hover:text-bone"
      >
        Clear all filters
      </Link>
    </div>
  );
}
