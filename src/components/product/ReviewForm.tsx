"use client";

import { clsx } from "clsx";
import { Star } from "lucide-react";
import { useState } from "react";
import { submitReview } from "@/actions/reviews";
import type { FormState } from "@/actions/contact";
import { useFormAction } from "@/components/forms/useFormAction";
import { buttonClass } from "@/components/ui/button";

export function ReviewForm({ productId }: { productId: string }) {
  const { state, pending, formProps } = useFormAction<FormState>(submitReview, {});
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);

  if (state.ok) {
    return <p className="border border-line bg-coal p-5 text-sm text-emerald-600">{state.message}</p>;
  }

  return (
    <form {...formProps} className="space-y-4 border border-line bg-coal p-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <fieldset>
        <legend className="eyebrow mb-2">Your rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(null)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              className="p-0.5"
            >
              <Star className={clsx("size-6", n <= (hover ?? rating) ? "fill-blood text-blood" : "text-ash")} />
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="review-title" className="eyebrow mb-2 block">
          Title (optional)
        </label>
        <input id="review-title" name="title" maxLength={100} className="field" />
      </div>
      <div>
        <label htmlFor="review-body" className="eyebrow mb-2 block">
          Your review
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={4}
          maxLength={2000}
          required
          className="field resize-y"
          aria-invalid={!!state.errors?.body}
        />
        {state.errors?.body && <p className="mt-1 text-xs text-blood">{state.errors.body}</p>}
      </div>
      {state.message && !state.ok && <p className="text-sm text-blood">{state.message}</p>}
      <button type="submit" disabled={pending} className={buttonClass({ variant: "light" })}>
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
