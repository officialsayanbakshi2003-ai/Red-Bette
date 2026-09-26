import { clsx } from "clsx";
import { discountPercent, formatINR } from "@/lib/money";

export function Price({
  price,
  compareAtPrice,
  className,
  size = "md",
}: {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const off = discountPercent(price, compareAtPrice);
  return (
    <div className={clsx("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span
        className={clsx(
          "font-display font-semibold tracking-wide",
          size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base",
        )}
      >
        {formatINR(price)}
      </span>
      {off != null && compareAtPrice != null && (
        <>
          <span className={clsx("text-mist line-through", size === "lg" ? "text-base" : "text-xs")}>
            {formatINR(compareAtPrice)}
          </span>
          <span className={clsx("font-semibold text-blood", size === "lg" ? "text-sm" : "text-xs")}>{off}% off</span>
        </>
      )}
    </div>
  );
}
