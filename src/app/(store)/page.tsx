import { ArrowRight, Gem, Leaf, RotateCcw, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { RemotePhoto } from "@/components/RemotePhoto";
import { Marquee } from "@/components/home/Marquee";
import { SectionHeading } from "@/components/home/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonClass } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories, getFeaturedProducts, getProductsByTag, getWishlistIds } from "@/lib/catalog";
import { commerce, siteConfig } from "@/lib/config";
import type { Photo } from "@/lib/media";
import { getStorefrontMedia } from "@/lib/site-media";
import { formatINR } from "@/lib/money";

const CATEGORY_ART: Record<string, string> = {
  joggers: "/products/flow-joggers-front.svg",
  accessories: "/products/betta-cap.svg",
};

export default async function HomePage() {
  const [user, featured, bestsellers, categories, media] = await Promise.all([
    getCurrentUser(),
    getFeaturedProducts(8),
    getProductsByTag("bestseller", 8),
    getCategories(),
    getStorefrontMedia(),
  ]);
  const CATEGORY_PHOTO: Record<string, Photo | undefined> = {
    hoodies: media.catHoodies,
    "oversized-tees": media.catTees,
    sweatshirts: media.catSweatshirts,
  };
  const wishlist = await getWishlistIds(user?.id);
  const tiles = categories.filter((c) => c._count.products > 0).slice(0, 4);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/mark.svg`,
    slogan: siteConfig.tagline,
    sameAs: [siteConfig.instagram],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero photo={media.hero} />
      <Marquee />

      {/* The drop */}
      <section id="drop" className="container-x scroll-mt-24 pt-20 sm:pt-28" aria-labelledby="drop-title">
        <SectionHeading id="drop-title" eyebrow="Drop 01" title="The" accent="new drop" href="/shop?tag=new" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {featured.map((p, i) => (
            <div key={p.id} data-reveal style={{ "--reveal-delay": `${(i % 4) * 80}ms` } as React.CSSProperties}>
              <ProductCard product={p} wishlisted={wishlist.has(p.id)} priority={i < 2} />
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center sm:hidden">
          <Link href="/shop?tag=new" className={buttonClass({ variant: "outline" })}>
            View all new
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container-x pt-24 sm:pt-32" aria-labelledby="cat-title">
        <SectionHeading id="cat-title" eyebrow="Shop by category" title="Pick your" accent="flow" href="/shop" linkLabel="Shop all" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:grid-rows-2">
          {tiles.map((c, i) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              data-reveal
              style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
              className={
                "group relative overflow-hidden bg-char " +
                (i === 0 ? "col-span-2 aspect-[4/3] lg:col-span-2 lg:row-span-2 lg:aspect-auto" : "aspect-[4/5] lg:aspect-auto lg:min-h-[300px]")
              }
            >
              {CATEGORY_PHOTO[c.slug] ? (
                <RemotePhoto
                  photo={CATEGORY_PHOTO[c.slug]!}
                  sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
              ) : (
                <Image
                  src={CATEGORY_ART[c.slug] ?? "/brand/mark.svg"}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover object-[50%_35%] transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.25em] text-mist">{c._count.products} styles</p>
                  <h3 className={"display mt-1 " + (i === 0 ? "text-4xl sm:text-6xl" : "text-2xl sm:text-3xl")}>{c.name}</h3>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-bone/30 transition-colors group-hover:border-blood group-hover:bg-blood">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial */}
      <section className="pt-24 sm:pt-32" aria-labelledby="story-title">
        <div className="container-x grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden bg-char lg:col-span-6" data-reveal>
            <RemotePhoto photo={media.story} sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          </div>
          <div className="lg:col-span-5 lg:col-start-8" data-reveal>
            <p className="eyebrow">The Red Betta story</p>
            <h2 id="story-title" className="display mt-4 text-5xl sm:text-6xl lg:text-7xl">
              Made to <br />
              <span className="text-blood">flow alone.</span>
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-mist">
              <p>
                The betta is a fighter. It won&apos;t share its water, it won&apos;t fade into the school, and when it
                moves, everything moves with it. That&apos;s who we make clothes for.
              </p>
              <p>
                Every Red Betta piece starts as hand-drawn art, printed on 400 GSM heavyweight cotton that holds its
                shape wash after wash. Small batches. Limited drops. No restocks on the rarest pieces.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className={buttonClass({ variant: "light" })}>
                Read our story
              </Link>
              <Link href="/products/made-to-flow-alone-hoodie" className={buttonClass({ variant: "outline" })}>
                Shop this hoodie
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="pt-24 sm:pt-32" aria-labelledby="best-title">
          <div className="container-x">
            <SectionHeading id="best-title" eyebrow="Most wanted" title="Best" accent="sellers" href="/shop?tag=bestseller" />
          </div>
          <div className="container-x">
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:gap-5 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
              {bestsellers.map((p) => (
                <div key={p.id} className="w-[70%] shrink-0 snap-start xs:w-[46%] sm:w-[38%] lg:w-auto">
                  <ProductCard product={p} wishlisted={wishlist.has(p.id)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full-bleed banner */}
      <section className="pt-24 sm:pt-32" aria-labelledby="widow-title">
        <div className="grain relative isolate overflow-hidden bg-[radial-gradient(80%_120%_at_80%_50%,#4a0407_0%,#0a0a0b_60%)]">
          <div className="container-x grid grid-cols-1 items-center gap-8 py-16 sm:py-20 lg:grid-cols-2">
            <div data-reveal>
              <p className="eyebrow !text-bone/70">Limited edition</p>
              <h2 id="widow-title" className="display mt-4 text-5xl sm:text-7xl">
                The <span className="text-blood">Red Widow</span>
              </h2>
              <p className="mt-5 max-w-md text-mist">
                The loudest piece in the drop. A widow spider in a crimson web, printed front, back and sleeve. Only a
                few hundred made.
              </p>
              <Link href="/products/red-widow-hoodie" className={buttonClass({ size: "lg", className: "mt-8" })}>
                Get yours <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md" data-reveal>
              <Image src="/products/red-widow-back.svg" alt="Red Widow hoodie, back print" fill unoptimized className="object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="container-x pt-24 sm:pt-28" aria-label="Why Red Betta">
        <ul className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line lg:grid-cols-4">
          {[
            { icon: Gem, title: "400 GSM heavyweight", body: "Brushed-back cotton that feels premium and lasts." },
            { icon: Leaf, title: "Made in India", body: "Cut, sewn and printed by small workshops we know by name." },
            { icon: Truck, title: "Free shipping", body: `On every order over ${formatINR(commerce.freeShippingThreshold)}. COD available.` },
            { icon: RotateCcw, title: `${commerce.returnWindowDays}-day returns`, body: "Wrong size? Exchange or return it, no drama." },
          ].map(({ icon: Icon, title, body }) => (
            <li key={title} className="bg-ink p-5 sm:p-8" data-reveal>
              <Icon className="size-6 text-blood" strokeWidth={1.5} />
              <p className="mt-4 font-display text-sm font-semibold uppercase tracking-[0.15em]">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-mist">{body}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
