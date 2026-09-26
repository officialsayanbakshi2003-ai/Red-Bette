import { Star } from "lucide-react";

export function Stars({ rating, className = "size-3.5" }: { rating: number; className?: string }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= Math.round(rating) ? "fill-blood text-blood" : "text-ash"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
