"use client";

import { Loader2, Search } from "lucide-react";
import { trackOrder } from "@/actions/track";
import type { FormState } from "@/actions/contact";
import { buttonClass } from "@/components/ui/button";
import { Field } from "./Field";
import { useFormAction } from "./useFormAction";

export function TrackOrderForm() {
  const { state, pending, formProps } = useFormAction<FormState>(trackOrder, {});
  return (
    <form {...formProps} className="space-y-5">
      <Field label="Order number" name="orderNumber" error={state.errors?.orderNumber} hint="In your confirmation email, e.g. RB260926-ABC123">
        <input id="orderNumber" name="orderNumber" autoComplete="off" maxLength={20} className="field uppercase" aria-invalid={!!state.errors?.orderNumber} />
      </Field>
      <Field label="Email used for the order" name="email" error={state.errors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" className="field" aria-invalid={!!state.errors?.email} />
      </Field>
      {state.message && (
        <p role="alert" className="border border-blood/40 bg-blood/5 px-4 py-3 text-sm">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClass({ size: "lg", block: true })}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <><Search className="size-4" /> Track order</>}
      </button>
    </form>
  );
}
