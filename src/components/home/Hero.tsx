import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { RemotePhoto } from "@/components/RemotePhoto";
import { buttonClass } from "@/components/ui/button";
import type { Photo } from "@/lib/media";

const BUBBLES = [
  { left: "12%", size: 10, delay: "0s", duration: "9s" },
  { left: "22%", size: 6, delay: "2.5s", duration: "11s" },
  { left: "35%", size: 14, delay: "4s", duration: "10s" },
  { left: "48%", size: 8, delay: "1s", duration: "12s" },
  { left: "58%", size: 5, delay: "6s", duration: "8s" },
  { left: "67%", size: 12, delay: "3s", duration: "13s" },
  { left: "78%", size: 7, delay: "5s", duration: "9.5s" },
  { left: "88%", size: 9, delay: "7s", duration: "11.5s" },
];

export function Hero({ photo }: { photo: Photo }) {
  return (
    <section className="grain relative isolate overflow-hidden bg-ink" aria-labelledby="hero-title">
      {/* Photo */}
      <div className="absolute inset-x-0 top-0 -z-20 h-[58%] lg:inset-y-0 lg:left-[38%] lg:h-auto">
        <RemotePhoto
          photo={photo}
          priority
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover object-center"
          fallbackClassName="object-contain p-10"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-ink/10 via-ink/70 to-ink lg:bg-gradient-to-r lg:from-ink lg:via-ink/70 lg:to-ink/10" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_75%_45%,rgba(227,20,27,0.18),transparent_70%)]" />

      {/* Rising bubbles */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="absolute bottom-[-20px] animate-rise rounded-full border border-bone/40"
            style={{ left: b.left, width: b.size, height: b.size, animationDelay: b.delay, animationDuration: b.duration }}
          />
        ))}
      </div>

      <p
        className="absolute right-4 top-8 hidden text-lg tracking-[0.4em] text-bone/80 [writing-mode:vertical-rl] sm:block lg:right-10"
        style={{ fontFamily: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif' }}
        aria-hidden="true"
      >
        流れが違う
      </p>

      <div className="container-x flex min-h-[calc(100svh-100px)] flex-col justify-end pb-12 pt-[46vh] sm:pt-[42vh] lg:justify-center lg:pb-16 lg:pt-16">
        <div className="max-w-2xl">
          <p className="eyebrow animate-fade-up !text-bone/80">Drop 01 · The Betta Collection</p>
          <h1 id="hero-title" className="display mt-4 text-[17vw] sm:text-[12vw] lg:text-[8.5vw] xl:text-[8rem]">
            <span className="block animate-fade-up [animation-delay:120ms]">Flow</span>
            <span className="block animate-fade-up text-blood [animation-delay:220ms]">Your way.</span>
          </h1>
          <p className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-bone/75 [animation-delay:320ms] sm:text-lg">
            Heavyweight streetwear with art that refuses to sit still. Built in India for the ones who move on
            their own terms.
          </p>
          <div className="mt-8 flex animate-fade-up flex-col gap-3 [animation-delay:420ms] xs:flex-row">
            <Link href="/shop?tag=new" className={buttonClass({ size: "lg" })}>
              Shop the drop <ArrowRight className="size-4" />
            </Link>
            <Link href="/shop?category=hoodies" className={buttonClass({ variant: "outline", size: "lg" })}>
              Explore hoodies
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
                <dd className="font-display text-xl font-bold italic sm:text-2xl">{k}</dd>
                <dd className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-mist">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <a
        href="#drop"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.6rem] uppercase tracking-[0.3em] text-mist hover:text-bone lg:flex"
      >
        Scroll
        <ChevronDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}
