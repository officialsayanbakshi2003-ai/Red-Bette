"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { login, register } from "@/actions/auth";
import type { FormState } from "@/actions/contact";
import { buttonClass } from "@/components/ui/button";
import { Field } from "./Field";
import { useFormAction } from "./useFormAction";

function PasswordInput({ name, autoComplete, invalid }: { name: string; autoComplete: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required
        maxLength={72}
        className="field pr-12"
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-error` : undefined}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-mist hover:text-bone"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const { state, pending, formProps } = useFormAction<FormState>(login, {});
  return (
    <form {...formProps} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email" name="email" error={state.errors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field"
          aria-invalid={!!state.errors?.email}
        />
      </Field>
      <Field label="Password" name="password" error={state.errors?.password}>
        <PasswordInput name="password" autoComplete="current-password" invalid={!!state.errors?.password} />
      </Field>
      {state.message && (
        <p role="alert" className="border border-blood/40 bg-blood/10 px-4 py-3 text-sm">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClass({ block: true, size: "lg" })}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
      </button>
      <p className="text-center text-sm text-mist">
        New to Red Betta?{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="text-bone underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const { state, pending, formProps } = useFormAction<FormState>(register, {});
  return (
    <form {...formProps} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Full name" name="name" error={state.errors?.name}>
        <input id="name" name="name" autoComplete="name" required maxLength={80} className="field" aria-invalid={!!state.errors?.name} />
      </Field>
      <Field label="Email" name="email" error={state.errors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className="field" aria-invalid={!!state.errors?.email} />
      </Field>
      <Field
        label="Password"
        name="password"
        error={state.errors?.password}
        hint="At least 8 characters, with a letter and a number."
      >
        <PasswordInput name="password" autoComplete="new-password" invalid={!!state.errors?.password} />
      </Field>
      {state.message && !state.errors && (
        <p role="alert" className="border border-blood/40 bg-blood/10 px-4 py-3 text-sm">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClass({ block: true, size: "lg" })}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Create account"}
      </button>
      <p className="text-center text-xs text-ash">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">Terms</Link> and{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2">Privacy Policy</Link>.
      </p>
      <p className="text-center text-sm text-mist">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="text-bone underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
