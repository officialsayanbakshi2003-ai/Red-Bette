"use client";

import { clsx } from "clsx";
import { useRef, useState } from "react";
import { ProductImage } from "./ProductImage";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const list = images.length ? images : ["/images/placeholder.svg"];

  const scrollTo = (i: number) => {
    setActive(i);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: track.clientWidth * i, behavior: "smooth" });
  };

  return (
    <div className="lg:grid lg:grid-cols-[84px_1fr] lg:gap-4">
      {/* Thumbnails (desktop) */}
      <div className="hidden flex-col gap-3 lg:flex">
        {list.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Show image ${i + 1}`}
            aria-current={active === i}
            className={clsx(
              "relative aspect-[4/5] w-full overflow-hidden bg-char transition-opacity",
              active === i ? "outline outline-1 outline-offset-2 outline-bone" : "opacity-60 hover:opacity-100",
            )}
          >
            <ProductImage src={src} alt="" fill sizes="84px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main track */}
      <div className="relative">
        <div
          ref={trackRef}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto sm:mx-0"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
          aria-roledescription="carousel"
          aria-label={`${name} images`}
        >
          {list.map((src, i) => (
            <div
              key={src + i}
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-char"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${list.length}`}
            >
              <ProductImage
                src={src}
                alt={i === 0 ? name : `${name}, view ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {list.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 lg:hidden">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Show image ${i + 1}`}
                className={clsx("h-1 rounded-full transition-all", active === i ? "w-6 bg-bone" : "w-2 bg-bone/40")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
