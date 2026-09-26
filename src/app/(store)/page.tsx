import { ArrowRight, Gem, Leaf, RotateCcw, Truck } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { RemotePhoto } from "@/components/RemotePhoto";
import { Marquee } from "@/components/home/Marquee";
import { SectionHeading } from "@/components/home/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonClass } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories, getProductsByTag, getProductsInCategory, getProductsOutsideCategory, getWishlistIds } from "@/lib/catalog";
import { Price } from "@/components/product/Price";
import { ProductImage } from "@/components/product/ProductImage";
import { commerce, siteConfig } from "@/lib/config";
import type { Photo } from "@/lib/media";
import { getStorefrontMedia } from "@/lib/site-media";
import { formatINR } from "@/lib/money";

export default async function HomePage() {
  const [user, hoodies, featured, bestsellers, categories, media] = await Promise.all([
    getCurrentUser(),
    getProductsInCategory("hoodies", 5),
    getProductsOutsideCategory("hoodies", 4),
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
  const tiles = categories.filter((c) => c._count.products > 0).slice(0, 5);
  // Lead with a hoodie that has a real photo (not vector artwork).
  const withPhoto = hoodies.filter((p) => p.images[0] && !p.images[0].endsWith(".svg"));
  const heroHoodie = withPhoto.find((p) => p.tags.includes("bestseller")) ?? withPhoto[0] ?? hoodies[0];
  // The big card reads best with a lifestyle shot, which we keep last in a product's gallery.
  const heroHoodieImage = heroHoodie && heroHoodie.images.length > 2 ? heroHoodie.images.at(-1) : heroHoodie?.images[0];
  const moreHoodies = hoodies.filter((p) => p.id !== heroHoodie?.id);

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

      {/* Hoodies: the hero product */}
      {heroHoodie && (
        <section id="hoodies" className="container-x scroll-mt-24 pt-20 sm:pt-28" aria-labelledby="hoodies-title">
          <SectionHeading id="hoodies-title" eyebrow="The hero piece" title="Heavyweight" accent="hoodies" href="/shop?category=hoodies" linkLabel="All hoodies" />
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 lg:grid-cols-2">
            <Link
              href={`/products/${heroHoodie.slug}`}
              className="theme-dark group relative block aspect-[4/5] overflow-hidden bg-char lg:aspect-auto lg:min-h-full"
              data-reveal
            >
              <ProductImage
                src={heroHoodieImage}
                alt={heroHoodie.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[50%_25%] transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8">
                <div>
                  <p className="eyebrow !text-bone/80">Signature · 400 GSM</p>
                  <h3 className="display mt-2 text-3xl sm:text-5xl">{heroHoodie.name}</h3>
                  <Price price={heroHoodie.price} compareAtPrice={heroHoodie.compareAtPrice} className="mt-3" />
                </div>
                <span className="hidden shrink-0 sm:block">
                  <span className={buttonClass({ size: "md" })}>
                    Shop now <ArrowRight className="size-4" />
                  </span>
                </span>
              </div>
            </Link>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5">
              {moreHoodies.slice(0, 4).map((p, i) => (
                <div key={p.id} data-reveal style={{ "--reveal-delay": `${(i % 2) * 80}ms` } as React.CSSProperties}>
                  <ProductCard product={p} wishlisted={wishlist.has(p.id)} sizes="(min-width: 1024px) 25vw, 50vw" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The drop */}
      <section id="drop" className="container-x scroll-mt-24 pt-24 sm:pt-32" aria-labelledby="drop-title">
        <SectionHeading id="drop-title" eyebrow="Drop 01" title="Tees &" accent="more" href="/shop" linkLabel="Shop all" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {featured.map((p, i) => (
            <div key={p.id} data-reveal style={{ "--reveal-delay": `${(i % 4) * 80}ms` } as React.CSSProperties}>
              <ProductCard product={p} wishlisted={wishlist.has(p.id)} />
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center sm:hidden">
          <Link href="/shop" className={buttonClass({ variant: "outline" })}>
            Shop all
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
                "theme-dark group relative overflow-hidden bg-char " +
                (i === 0 ? "col-span-2 aspect-[4/3] lg:col-span-2 lg:row-span-2 lg:aspect-auto" : "aspect-[4/5] lg:aspect-auto lg:min-h-[300px]")
              }
            >
              {CATEGORY_PHOTO[c.slug] ? (
                <RemotePhoto
                  photo={CATEGORY_PHOTO[c.slug]!}
                  sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="object-cover object-[50%_25%] transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_80%_20%,#4a0407_0%,#0a0a0b_70%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.25em] text-mist">{c._count.products} {c._count.products === 1 ? "style" : "styles"}</p>
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
          </div>
          <div className="lg:col-span-5 lg:col-start-8" data-reveal>
            <p className="eyebrow">How it&apos;s made</p>
            <h2 id="story-title" className="display mt-4 text-5xl sm:text-6xl lg:text-7xl">
              Printed by hand. <br />
              <span className="text-blood">Built to last.</span>
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-mist">
              <p>
                Every Red Betta design starts as original artwork: crimson fins, blood moons, lone wolves, red widows,
                mountain ridges. No stock graphics, no copies.
              </p>
              <p>
                Each piece is screen printed in small batches on 400 GSM heavyweight cotton that holds its shape wash
                after wash. Limited drops, and the rarest pieces never come back.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className={buttonClass({ variant: "light" })}>
                Read our story
              </Link>
              <Link href="/shop?category=hoodies" className={buttonClass({ variant: "outline" })}>
                Shop hoodies
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
      <section className="pt-24 sm:pt-32" aria-labelledby="banner-title">
        <div className="theme-dark relative isolate overflow-hidden bg-ink">
          <div className="absolute inset-0 -z-10">
            <RemotePhoto photo={media.banner} sizes="100vw" className="object-cover object-right" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/10" />
          </div>
          <div className="container-x py-20 sm:py-28" data-reveal>
            <p className="eyebrow !text-bone/80">Limited drops</p>
            <h2 id="banner-title" className="display mt-4 max-w-2xl text-[2.6rem] xs:text-5xl sm:text-7xl">
              Different route. <span className="text-blood">Same destination.</span>
            </h2>
            <p className="mt-5 max-w-md text-bone/80">
              Small batches, original art and no restocks on the rarest pieces. When a drop is gone, it&apos;s gone.
            </p>
            <Link href="/shop?category=hoodies" className={buttonClass({ size: "lg", className: "mt-8" })}>
              Shop hoodies <ArrowRight className="size-4" />
            </Link>
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
