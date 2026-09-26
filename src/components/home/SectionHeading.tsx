import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  accent,
  href,
  linkLabel = "View all",
  id,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 sm:mb-10" data-reveal>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="display mt-3 text-4xl sm:text-5xl lg:text-6xl">
          {title} {accent && <span className="text-blood">{accent}</span>}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group hidden shrink-0 items-center gap-2 pb-2 font-display text-xs font-semibold uppercase tracking-[0.22em] text-bone/80 hover:text-bone sm:flex"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
