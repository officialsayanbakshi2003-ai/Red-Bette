"use client";

import { Loader2 } from "lucide-react";
import { submitContact, type FormState } from "@/actions/contact";
import { buttonClass } from "@/components/ui/button";
import { Field } from "./Field";
import { useFormAction } from "./useFormAction";

export function ContactForm() {
  const { state, pending, formProps } = useFormAction<FormState>(submitContact, {});
  if (state.ok) {
    return <p className="border border-emerald-400/40 bg-emerald-400/10 p-6 text-sm">{state.message}</p>;
  }
  const e = state.errors ?? {};
  return (
    <form {...formProps} className="grid gap-5 sm:grid-cols-2">
      {/* Honeypot: hidden from people, tempting for bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <Field label="Name" name="name" error={e.name}>
        <input id="name" name="name" autoComplete="name" maxLength={80} className="field" aria-invalid={!!e.name} />
      </Field>
      <Field label="Email" name="email" error={e.email}>
        <input id="email" name="email" type="email" autoComplete="email" className="field" aria-invalid={!!e.email} />
      </Field>
      <Field label="Subject" name="subject" error={e.subject} className="sm:col-span-2">
        <input id="subject" name="subject" maxLength={120} placeholder="Order RB…, sizing, collaborations" className="field" aria-invalid={!!e.subject} />
      </Field>
      <Field label="Message" name="message" error={e.message} className="sm:col-span-2">
        <textarea id="message" name="message" rows={6} maxLength={4000} className="field resize-y" aria-invalid={!!e.message} />
      </Field>
      {state.message && <p className="text-sm text-blood sm:col-span-2">{state.message}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass({ size: "lg" })}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Send message"}
        </button>
      </div>
    </form>
  );
}
