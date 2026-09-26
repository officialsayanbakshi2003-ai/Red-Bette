"use client";

import { startTransition, useActionState, useRef } from "react";
import type { FormState } from "@/actions/contact";

/**
 * Runs a server action from a form without React's automatic form reset, so
 * a failed submission keeps everything the user typed. Fields are cleared
 * only when the action succeeds and `resetOnSuccess` is set.
 */
export function useFormAction<S extends FormState = FormState>(
  action: (prev: S, formData: FormData) => Promise<S>,
  initial: S,
  options: { resetOnSuccess?: boolean; onSuccess?: (state: S) => void } = {},
) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, dispatch, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const next = await action(prev as S, formData);
    if (next.ok) {
      if (options.resetOnSuccess) ref.current?.reset();
      options.onSuccess?.(next);
    }
    return next;
  }, initial);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  return { state: state as S, pending, formProps: { ref, onSubmit, noValidate: true } };
}
