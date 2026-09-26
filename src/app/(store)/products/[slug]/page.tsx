import { ChevronDown, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Price } from "@/components/product/Price";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ReviewForm } from "@/components/product/ReviewForm";
import { chartForCategory } from "@/components/product/SizeGuide";
import { Stars } from "@/components/product/Stars";
import { getCurrentUser } from "@/lib/auth/session";
import { getProductBySlug, getRelatedProducts, getWishlistIds, totalStock } from "@/lib/catalog";
import { commerce, siteConfig } from "@/lib/config";
import { formatINR } from "@/lib/money";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const description = product.description.slice(0, 155);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} · ${siteConfig.name}`,
      description,
      images: product.images[0] && !product.images[0].endsWith(".svg") ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, user] = await Promise.all([getProductBySlug(slug), getCurrentUser()]);
  if (!product) notFound();

  const [related, wishlist] = await Promise.all([
    getRelatedProducts(product.id, product.category.id),
    getWishlistIds(user?.id),
  ]);
  const inStock = totalStock(product.variants) > 0;
  const absoluteImage = (src: string) => (src.startsWith("http") ? src : `${siteConfig.url}${src}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map(absoluteImage),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: siteConfig.name },
    category: product.category.name,
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/products/${product.slug}`,
      priceCurrency: "INR",
      price: (product.price / 100).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.averageRating && product._count.reviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.averageRating.toFixed(1),
            reviewCount: product._count.reviews,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="container-x pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ash">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-bone">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/shop?category=${product.category.slug}`} className="hover:text-bone">{product.category.name}</Link></li>
            <li aria-hidden="true">/</li>
            <li className="truncate text-mist">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <ProductGallery images={product.images} name={product.name} />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-wrap items-center gap-2">
              {product.tags.includes("new") && (
                <span className="bg-blood px-2 py-1 font-display text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white">New</span>
              )}
              {product.tags.includes("limited") && (
                <span className="border border-bone/40 px-2 py-1 font-display text-[0.6rem] font-semibold uppercase tracking-[0.18em]">Limited</span>
              )}
              {product.tags.includes("bestseller") && (
                <span className="border border-bone/40 px-2 py-1 font-display text-[0.6rem] font-semibold uppercase tracking-[0.18em]">Bestseller</span>
              )}
            </div>
            <h1 className="display mt-4 text-4xl sm:text-5xl">{product.name}</h1>
            {product.averageRating != null && product._count.reviews > 0 && (
              <a href="#reviews" className="mt-3 flex items-center gap-2 text-xs text-mist hover:text-bone">
                <Stars rating={product.averageRating} />
                {product.averageRating.toFixed(1)} · {product._count.reviews} review{product._count.reviews === 1 ? "" : "s"}
              </a>
            )}
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" className="mt-5" />
            <p className="mt-1 text-xs text-mist">Inclusive of all taxes</p>

            <p className="mt-6 text-sm leading-relaxed text-bone/80">{product.description}</p>

            <div className="mt-8">
              <ProductPurchase
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.images[0] ?? null,
                }}
                variants={product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, stock: v.stock }))}
                wishlisted={wishlist.has(product.id)}
                sizeChart={chartForCategory(product.category.slug)}
              />
            </div>

            <div className="mt-8 divide-y divide-line border-y border-line">
              <details className="group" open>
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-display text-xs font-semibold uppercase tracking-[0.2em] [&::-webkit-details-marker]:hidden">
                  Details &amp; fit
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="space-y-2 pb-5 text-sm text-mist">
                  {product.details.map((d) => (
                    <li key={d} className="flex gap-3">
                      <span className="mt-2 size-1 shrink-0 bg-blood" />
                      {d}
                    </li>
                  ))}
                </ul>
              </details>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-display text-xs font-semibold uppercase tracking-[0.2em] [&::-webkit-details-marker]:hidden">
                  Shipping &amp; returns
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-2 pb-5 text-sm text-mist">
                  <p>
                    Free shipping on orders over {formatINR(commerce.freeShippingThreshold)}, otherwise{" "}
                    {formatINR(commerce.shippingFee)}. Orders ship within 24 to 48 hours and arrive in 3 to 7 working days.
                  </p>
                  <p>
                    Easy {commerce.returnWindowDays}-day returns and size exchanges on unworn items with tags.{" "}
                    <Link href="/shipping-returns" className="text-bone underline underline-offset-4">Read the policy</Link>.
                  </p>
                </div>
              </details>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-display text-xs font-semibold uppercase tracking-[0.2em] [&::-webkit-details-marker]:hidden">
                  Care
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-5 text-sm text-mist">
                  Turn inside out. Machine wash cold with similar colours. Do not bleach. Do not tumble dry. Iron on
                  reverse, avoiding the print.
                </p>
              </details>
            </div>

            <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-[0.65rem] uppercase tracking-[0.15em] text-mist">
              <li className="flex flex-col items-center gap-2 border border-line px-2 py-4">
                <Truck className="size-4 text-bone" /> Fast delivery
              </li>
              <li className="flex flex-col items-center gap-2 border border-line px-2 py-4">
                <RotateCcw className="size-4 text-bone" /> Easy returns
              </li>
              <li className="flex flex-col items-center gap-2 border border-line px-2 py-4">
                <ShieldCheck className="size-4 text-bone" /> Secure payment
              </li>
            </ul>
          </div>
        </div>

        {/* Reviews */}
        <section id="reviews" className="mt-24 scroll-mt-24 border-t border-line pt-12" aria-labelledby="reviews-title">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 id="reviews-title" className="display text-4xl">Reviews</h2>
              {product._count.reviews > 0 && product.averageRating != null ? (
                <div className="mt-4 flex items-center gap-3">
                  <span className="font-display text-5xl font-extrabold">{product.averageRating.toFixed(1)}</span>
                  <div>
                    <Stars rating={product.averageRating} className="size-4" />
                    <p className="mt-1 text-xs text-mist">
                      Based on {product._count.reviews} review{product._count.reviews === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-mist">No reviews yet. Bought this piece? Be the first to review it.</p>
              )}
              <div className="mt-8">
                {user ? (
                  <ReviewForm productId={product.id} />
                ) : (
                  <p className="text-sm text-mist">
                    <Link href={`/login?next=/products/${product.slug}%23reviews`} className="text-bone underline underline-offset-4">
                      Sign in
                    </Link>{" "}
                    to review a product you&apos;ve bought.
                  </p>
                )}
              </div>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              {product.reviews.length > 0 && (
                <ul className="divide-y divide-line border-y border-line">
                  {product.reviews.map((r) => (
                    <li key={r.id} className="py-6">
                      <div className="flex items-center justify-between gap-4">
                        <Stars rating={r.rating} />
                        <time className="text-xs text-ash" dateTime={r.createdAt.toISOString()}>
                          {r.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </time>
                      </div>
                      {r.title && <p className="mt-3 font-display font-semibold">{r.title}</p>}
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-mist">{r.body}</p>
                      <p className="mt-3 text-xs text-ash">
                        {r.user.name.split(" ")[0]} · <span className="text-emerald-600/80">Verified buyer</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-24" aria-labelledby="related-title">
            <h2 id="related-title" className="display mb-8 text-4xl sm:text-5xl">
              You may <span className="text-blood">also like</span>
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} wishlisted={wishlist.has(p.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
