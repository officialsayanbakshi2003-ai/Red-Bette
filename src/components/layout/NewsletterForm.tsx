"use client";

import { clsx } from "clsx";
import { ArrowRight, Loader2 } from "lucide-react";
import { subscribeNewsletter, type FormState } from "@/actions/contact";
import { useFormAction } from "@/components/forms/useFormAction";

export function NewsletterForm({ className }: { className?: string }) {
  const { state, pending, formProps } = useFormAction<FormState>(subscribeNewsletter, {}, { resetOnSuccess: true });
  return (
    <form {...formProps} className={clsx("w-full", className)}>
      <div className="flex border-b border-bone/40 focus-within:border-bone">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-ash"
          aria-invalid={state.ok === false}
          aria-describedby="newsletter-status"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 pl-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-bone hover:text-blood disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <>Join <ArrowRight className="size-4" /></>}
        </button>
      </div>
      <p
        id="newsletter-status"
        aria-live="polite"
        className={clsx("mt-2 min-h-5 text-xs", state.ok ? "text-emerald-400" : "text-blood")}
      >
        {state.message}
      </p>
    </form>
  );
}
