"use client";

import { Loader2 } from "lucide-react";
import { changePassword, saveAddress, updateProfile } from "@/actions/account";
import type { FormState } from "@/actions/contact";
import { Field } from "@/components/forms/Field";
import { useFormAction } from "@/components/forms/useFormAction";
import { buttonClass } from "@/components/ui/button";
import { INDIAN_STATES } from "@/lib/india";

function Status({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={state.ok ? "text-sm text-emerald-400" : "text-sm text-blood"}>
      {state.message}
    </p>
  );
}

export function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string | null }) {
  const { state, pending, formProps } = useFormAction<FormState>(updateProfile, {});
  return (
    <form {...formProps} className="grid gap-5 sm:grid-cols-2">
      <Field label="Full name" name="name" error={state.errors?.name}>
        <input id="name" name="name" defaultValue={name} autoComplete="name" maxLength={80} className="field" aria-invalid={!!state.errors?.name} />
      </Field>
      <Field label="Mobile number" name="phone" error={state.errors?.phone} optional>
        <input id="phone" name="phone" type="tel" inputMode="numeric" defaultValue={phone ?? ""} autoComplete="tel-national" maxLength={14} className="field" aria-invalid={!!state.errors?.phone} />
      </Field>
      <Field label="Email" name="email-readonly" className="sm:col-span-2" hint="Contact support to change the email on your account.">
        <input id="email-readonly" value={email} readOnly disabled className="field opacity-60" />
      </Field>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass({ variant: "light" })}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const { state, pending, formProps } = useFormAction<FormState>(changePassword, {}, { resetOnSuccess: true });
  return (
    <form {...formProps} className="grid gap-5 sm:grid-cols-2">
      <Field label="Current password" name="currentPassword" error={state.errors?.currentPassword} className="sm:col-span-2">
        <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" maxLength={72} className="field" aria-invalid={!!state.errors?.currentPassword} />
      </Field>
      <Field label="New password" name="newPassword" error={state.errors?.newPassword} hint="At least 8 characters, with a letter and a number.">
        <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" maxLength={72} className="field" aria-invalid={!!state.errors?.newPassword} />
      </Field>
      <Field label="Confirm new password" name="confirmPassword" error={state.errors?.confirmPassword}>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" maxLength={72} className="field" aria-invalid={!!state.errors?.confirmPassword} />
      </Field>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass({ variant: "light" })}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Update password"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function AddressForm({ onDone }: { onDone?: () => void }) {
  const { state, pending, formProps } = useFormAction<FormState>(saveAddress, {}, {
    resetOnSuccess: true,
    onSuccess: () => onDone?.(),
  });
  const e = state.errors ?? {};
  return (
    <form {...formProps} className="grid gap-5 sm:grid-cols-2">
      <Field label="Full name" name="fullName" error={e.fullName}>
        <input id="fullName" name="fullName" autoComplete="name" maxLength={80} className="field" aria-invalid={!!e.fullName} />
      </Field>
      <Field label="Mobile number" name="phone" error={e.phone}>
        <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={14} className="field" aria-invalid={!!e.phone} />
      </Field>
      <Field label="House / flat, street" name="line1" error={e.line1} className="sm:col-span-2">
        <input id="line1" name="line1" autoComplete="address-line1" maxLength={160} className="field" aria-invalid={!!e.line1} />
      </Field>
      <Field label="Area, landmark" name="line2" error={e.line2} className="sm:col-span-2" optional>
        <input id="line2" name="line2" autoComplete="address-line2" maxLength={160} className="field" />
      </Field>
      <Field label="City" name="city" error={e.city}>
        <input id="city" name="city" autoComplete="address-level2" maxLength={80} className="field" aria-invalid={!!e.city} />
      </Field>
      <Field label="PIN code" name="postalCode" error={e.postalCode}>
        <input id="postalCode" name="postalCode" inputMode="numeric" autoComplete="postal-code" maxLength={6} className="field" aria-invalid={!!e.postalCode} />
      </Field>
      <Field label="State" name="state" error={e.state} className="sm:col-span-2">
        <select id="state" name="state" defaultValue="" autoComplete="address-level1" className="field" aria-invalid={!!e.state}>
          <option value="" disabled>
            Select state
          </option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>
      <label className="flex items-center gap-3 text-sm text-mist sm:col-span-2">
        <input type="checkbox" name="isDefault" className="size-4 accent-[#e3141b]" /> Make this my default address
      </label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass({ variant: "light" })}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Save address"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}
