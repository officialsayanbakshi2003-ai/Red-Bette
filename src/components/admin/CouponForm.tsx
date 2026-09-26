"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { createCoupon } from "@/actions/admin";
import type { FormState } from "@/actions/contact";
import { Field } from "@/components/forms/Field";
import { useFormAction } from "@/components/forms/useFormAction";
import { buttonClass } from "@/components/ui/button";
import { toast } from "@/store/toast";
import { adminInput } from "./ui";

export function CouponForm() {
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const { state, pending, formProps } = useFormAction<FormState>(createCoupon, {}, {
    resetOnSuccess: true,
    onSuccess: (result) => {
      toast(result.message ?? "Saved", "success");
      setType("PERCENT");
    },
  });
  const e = state.errors ?? {};
  return (
    <form {...formProps} className="h-fit space-y-4 border border-line bg-coal p-5">
      <h2 className="text-sm font-semibold">New coupon</h2>
      <Field label="Code" name="code" error={e.code}>
        <input id="code" name="code" maxLength={32} placeholder="DIWALI20" className={adminInput + " uppercase"} />
      </Field>
      <Field label="Description" name="description" optional>
        <input id="description" name="description" maxLength={200} placeholder="20% off for Diwali" className={adminInput} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type" name="type">
          <select id="type" name="type" value={type} onChange={(ev) => setType(ev.target.value as "PERCENT" | "FIXED")} className={adminInput}>
            <option value="PERCENT">Percent off</option>
            <option value="FIXED">Fixed ₹ off</option>
          </select>
        </Field>
        <Field label={type === "PERCENT" ? "Percent" : "Amount (₹)"} name="value" error={e.value}>
          <input id="value" name="value" inputMode="decimal" className={adminInput} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Min. order (₹)" name="minSubtotal" error={e.minSubtotal}>
          <input id="minSubtotal" name="minSubtotal" inputMode="decimal" defaultValue="0" className={adminInput} />
        </Field>
        {type === "PERCENT" ? (
          <Field label="Max. discount (₹)" name="maxDiscount" error={e.maxDiscount} optional>
            <input id="maxDiscount" name="maxDiscount" inputMode="decimal" className={adminInput} />
          </Field>
        ) : (
          <div />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Usage limit" name="maxUses" error={e.maxUses} optional>
          <input id="maxUses" name="maxUses" inputMode="numeric" className={adminInput} />
        </Field>
        <Field label="Expires on" name="expiresAt" error={e.expiresAt} optional>
          <input id="expiresAt" name="expiresAt" type="date" className={adminInput} />
        </Field>
      </div>
      {state.message && !state.ok && <p className="text-sm text-blood">{state.message}</p>}
      <button type="submit" disabled={pending} className={buttonClass({ variant: "light", block: true })}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Create coupon"}
      </button>
    </form>
  );
}
