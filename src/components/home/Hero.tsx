import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { RemotePhoto } from "@/components/RemotePhoto";
import { buttonClass } from "@/components/ui/button";
import type { Photo } from "@/lib/media";

export function Hero({ photo }: { photo: Photo }) {
  return (
    <section className="theme-dark relative isolate overflow-hidden bg-ink" aria-labelledby="hero-title">
      <div className="grid min-h-[calc(100svh-100px)] grid-cols-1 lg:grid-cols-12">
        {/* Photo: full-bleed on mobile, right column on desktop */}
        <div className="absolute inset-0 -z-10 lg:relative lg:inset-auto lg:z-0 lg:order-2 lg:col-span-6 xl:col-span-7">
          <RemotePhoto
            photo={photo}
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover object-[50%_30%]"
            fallbackClassName="object-contain p-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10 lg:bg-gradient-to-r lg:from-ink lg:via-transparent lg:to-transparent" />
        </div>

        <div className="container-x flex flex-col justify-end pb-12 pt-[48svh] lg:order-1 lg:col-span-6 lg:justify-center lg:py-20 lg:pr-12 xl:col-span-5">
          <p className="eyebrow animate-fade-up !text-bone/80">New collection · Drop 01</p>
          <h1 id="hero-title" className="display mt-4 text-[16vw] sm:text-[11vw] lg:text-[6.6vw] xl:text-[7rem]">
            <span className="block animate-fade-up [animation-delay:120ms]">Flow</span>
            <span className="block animate-fade-up text-blood [animation-delay:220ms]">Your way.</span>
          </h1>
          <p className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-bone/80 [animation-delay:320ms] sm:text-lg">
            Heavyweight streetwear with bold, hand-drawn art. Designed in India for the ones who move on their own
            terms.
          </p>
          <div className="mt-8 flex animate-fade-up flex-col gap-3 [animation-delay:420ms] xs:flex-row">
            <Link href="/shop?category=hoodies" className={buttonClass({ size: "lg" })}>
              Shop hoodies <ArrowRight className="size-4" />
            </Link>
            <Link href="/shop" className={buttonClass({ variant: "outline", size: "lg" })}>
              Shop all
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md animate-fade-up grid-cols-3 gap-4 border-t border-line pt-6 [animation-delay:520ms]">
            {[
              ["400", "GSM heavyweight"],
              ["100%", "Made in India"],
              ["7-day", "Easy returns"],
            ].map(([k, v]) => (
              <div key={v}>
                <dt className="sr-only">{v}</dt>
                <dd className="font-display text-xl font-extrabold sm:text-2xl">{k}</dd>
                <dd className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-mist">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
