import { clsx } from "clsx";

type Variant = "primary" | "light" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 font-display font-semibold uppercase tracking-[0.18em] transition-[background-color,color,border-color,transform,opacity] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-blood text-white hover:bg-blood-hot",
  light: "bg-bone text-ink hover:bg-white",
  outline: "border border-bone/30 text-bone hover:border-bone hover:bg-bone hover:text-ink",
  ghost: "text-bone hover:bg-white/5",
  danger: "border border-blood/50 text-blood hover:bg-blood hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.68rem]",
  md: "h-12 px-6 text-[0.72rem]",
  lg: "h-14 px-8 text-xs",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
  block = false,
}: { variant?: Variant; size?: Size; className?: string; block?: boolean } = {}) {
  return clsx(base, variants[variant], sizes[size], block && "w-full", className);
}
