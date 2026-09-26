import { clsx } from "clsx";

// "RED" wordmark drawn as paths so it looks identical everywhere.
const R = "M0 0H50Q66 0 66 16V24Q66 35 55 38L68 60H49L37 39H17V60H0Z M17 13V26H47Q49 26 49 24V15Q49 13 47 13Z";
const E = "M0 0H56V13H17V23.5H50V36.5H17V47H56V60H0Z";
const D = "M0 0H46Q66 0 66 20V40Q66 60 46 60H0Z M17 13V47H44Q49 47 49 42V18Q49 13 44 13Z";

export function RedWordmark({ className, fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="-16 0 226 60" className={className} aria-hidden="true" focusable="false">
      <g transform="skewX(-14)" fill={fill} fillRule="evenodd">
        <path d={R} />
        <path transform="translate(76 0)" d={E} />
        <path transform="translate(142 0)" d={D} />
      </g>
    </svg>
  );
}

/** Horizontal logo for the header: RED (red) + BETTA (spaced, light). */
export function Logo({ className, stacked = false }: { className?: string; stacked?: boolean }) {
  if (stacked) {
    return (
      <span className={clsx("inline-flex flex-col items-center leading-none", className)}>
        <RedWordmark className="h-[1em] w-auto text-blood" />
        <span className="mt-[0.28em] pl-[0.6em] font-display text-[0.32em] font-light tracking-[0.6em]">BETTA</span>
      </span>
    );
  }
  return (
    <span className={clsx("inline-flex items-center gap-[0.45em] leading-none", className)}>
      <RedWordmark className="h-[1em] w-auto text-blood" />
      <span className="font-display text-[0.42em] font-light tracking-[0.5em]">BETTA</span>
      <span className="sr-only">Red Betta</span>
    </span>
  );
}
