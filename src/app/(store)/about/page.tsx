import type { Metadata } from "next";
import Link from "next/link";
import { RemotePhoto } from "@/components/RemotePhoto";
import { buttonClass } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { MEDIA_SLOTS } from "@/lib/media";
import { getStorefrontMedia } from "@/lib/site-media";

export const metadata: Metadata = {
  title: "Our story",
  description: `The story behind ${siteConfig.name}, a premium streetwear label ${siteConfig.parentLine.toLowerCase()}.`,
};

export default async function AboutPage() {
  const media = await getStorefrontMedia();
  const credits = [...new Set(Object.values(MEDIA_SLOTS).map((s) => s.photo.credit))].filter((c) => c !== "Pexels");
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <RemotePhoto photo={media.aboutHero} priority sizes="100vw" className="object-cover" fallbackClassName="object-contain p-16" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        </div>
        <div className="container-x flex min-h-[70svh] flex-col justify-end pb-14 pt-32">
          <p className="eyebrow !text-bone/80">{siteConfig.parentLine}</p>
          <h1 className="display mt-4 max-w-4xl text-6xl sm:text-8xl">
            Born to <span className="text-blood">flow different.</span>
          </h1>
        </div>
      </section>

      <section className="container-x grid grid-cols-1 gap-12 py-20 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-6 text-base leading-relaxed text-bone/80 sm:text-lg lg:col-span-6">
          <p>
            The betta is small, fierce and impossible to ignore. It doesn&apos;t swim with the school. It holds its own
            water, flares its fins and moves like nothing else in the tank. We named the label after it because
            that&apos;s the energy we design for.
          </p>
          <p>
            {siteConfig.name} is a streetwear label {siteConfig.parentLine.toLowerCase()}. Every piece starts as
            hand-drawn art: crimson bettas, blood moons, lone wolves, red widows. We print it big and bold on
            heavyweight cotton and finish it with the details you notice later, like red-tipped drawcords, hood stripes and
            sleeve prints.
          </p>
          <p>
            We make small batches, drop them in limited runs and rarely restock the loudest pieces. When it&apos;s gone,
            it&apos;s gone.
          </p>
          <Link href="/shop" className={buttonClass({ size: "lg", className: "mt-4" })}>
            Shop the collection
          </Link>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-char lg:col-span-5 lg:col-start-8">
          <RemotePhoto photo={media.aboutStudio} sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section className="border-y border-line bg-coal">
        <div className="container-x grid grid-cols-1 gap-px sm:grid-cols-3">
          {[
            ["Heavyweight", "400 GSM brushed-back fleece and 240 GSM jersey that feel expensive and hold their shape."],
            ["Hand-drawn", "Original artwork for every drop, printed with high-density puff and HD screen prints."],
            ["Made in India", "Cut, sewn and printed by small workshops we know by name, paid fairly and on time."],
          ].map(([title, body]) => (
            <div key={title} className="py-10 sm:px-8">
              <p className="display text-3xl text-blood">{title}</p>
              <p className="mt-3 text-sm leading-relaxed text-mist">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-20 text-center">
        <p className="eyebrow">{siteConfig.parentLine}</p>
        <p className="display mx-auto mt-4 max-w-3xl text-4xl sm:text-6xl">
          Different route. <span className="text-blood">Same destination.</span>
        </p>
        <p className="mx-auto mt-10 max-w-xl text-xs text-ash">
          Lifestyle photography courtesy of Pexels contributors{credits.length ? `: ${credits.join(", ")}` : ""}.
        </p>
      </section>
    </>
  );
}
