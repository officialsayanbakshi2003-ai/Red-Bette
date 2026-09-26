import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import { discountPercent } from "@/lib/money";
import { sizeLabel, sizeRank } from "@/lib/config";
import { Price } from "./Price";
import { ProductImage } from "./ProductImage";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({
  product,
  wishlisted = false,
  priority = false,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
}: {
  product: ProductCardData;
  wishlisted?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  const inStock = product.variants.filter((v) => v.stock > 0);
  const soldOut = inStock.length === 0;
  const off = discountPercent(product.price, product.compareAtPrice);
  const isNew = product.tags.includes("new");
  const isLimited = product.tags.includes("limited");
  const sizeList = [...new Set(product.variants.map((v) => v.size))].sort((a, b) => sizeRank(a) - sizeRank(b));
  const [primary, secondary] = product.images;

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-char">
        <Link href={`/products/${product.slug}`} className="absolute inset-0" aria-label={product.name}>
          <ProductImage
            src={primary}
            alt={product.name}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {secondary && (
            <ProductImage
              src={secondary}
              alt=""
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
          {soldOut ? (
            <span className="bg-bone px-2 py-1 font-display text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink">
              Sold out
            </span>
          ) : (
            <>
              {isNew && (
                <span className="bg-blood px-2 py-1 font-display text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white">
                  New
                </span>
              )}
              {isLimited && (
                <span className="border border-bone/40 bg-ink/70 px-2 py-1 font-display text-[0.6rem] font-semibold uppercase tracking-[0.18em] backdrop-blur">
                  Limited
                </span>
              )}
              {off != null && (
                <span className="bg-ink/80 px-2 py-1 font-display text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-blood backdrop-blur">
                  −{off}%
                </span>
              )}
            </>
          )}
        </div>

        <WishlistButton
          productId={product.id}
          initial={wishlisted}
          className="absolute right-2 top-2 sm:right-3 sm:top-3"
        />

        {!soldOut && sizeList.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full bg-ink/85 px-3 py-2.5 backdrop-blur transition-transform duration-300 group-hover:translate-y-0 md:block">
            <p className="flex flex-wrap gap-x-3 gap-y-1 font-display text-[0.68rem] uppercase tracking-[0.2em]">
              {sizeList.map((s) => {
                const available = product.variants.some((v) => v.size === s && v.stock > 0);
                return (
                  <span key={s} className={available ? "text-bone" : "text-ash line-through"}>
                    {sizeLabel(s)}
                  </span>
                );
              })}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-3">
        <p className="eyebrow !text-[0.6rem] !tracking-[0.25em]">{product.category.name}</p>
        <h3 className="font-display text-sm font-medium leading-snug tracking-wide sm:text-[0.95rem]">
          <Link href={`/products/${product.slug}`} className="hover:text-blood">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
      </div>
    </article>
  );
}
