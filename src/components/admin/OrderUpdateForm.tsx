"use client";

import { Loader2 } from "lucide-react";
import { updateOrder } from "@/actions/admin";
import type { FormState } from "@/actions/contact";
import { Field } from "@/components/forms/Field";
import { useFormAction } from "@/components/forms/useFormAction";
import { buttonClass } from "@/components/ui/button";
import { adminInput } from "./ui";

export function OrderUpdateForm({
  order,
}: {
  order: {
    id: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    courier: string | null;
    trackingNumber: string | null;
    adminNote: string | null;
  };
}) {
  const { state, pending, formProps } = useFormAction<FormState>(updateOrder, {});
  const locked = order.status === "CANCELLED";
  return (
    <form {...formProps} className="space-y-4">
      <input type="hidden" name="orderId" value={order.id} />
      <Field label="Order status" name="status" error={state.errors?.status}>
        <select id="status" name="status" defaultValue={order.status} disabled={locked} className={adminInput}>
          {order.status === "PENDING" && <option value="PENDING">Awaiting payment</option>}
          <option value="CONFIRMED">Confirmed (to ship)</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled (returns stock)</option>
        </select>
        {locked && <input type="hidden" name="status" value="CANCELLED" />}
      </Field>
      <Field label="Payment status" name="paymentStatus" error={state.errors?.paymentStatus} hint={order.paymentMethod === "COD" ? "Mark COD orders as paid once cash is collected." : "Mark refunded after refunding in the Razorpay dashboard."}>
        <select id="paymentStatus" name="paymentStatus" defaultValue={order.paymentStatus} className={adminInput}>
          <option value="PENDING">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Courier" name="courier" error={state.errors?.courier}>
          <input id="courier" name="courier" defaultValue={order.courier ?? ""} placeholder="Delhivery, Blue Dart…" maxLength={60} className={adminInput} />
        </Field>
        <Field label="Tracking number" name="trackingNumber" error={state.errors?.trackingNumber}>
          <input id="trackingNumber" name="trackingNumber" defaultValue={order.trackingNumber ?? ""} maxLength={80} className={adminInput} />
        </Field>
      </div>
      <Field label="Internal note" name="adminNote" hint="Only visible to admins.">
        <textarea id="adminNote" name="adminNote" defaultValue={order.adminNote ?? ""} rows={3} maxLength={1000} className={adminInput} />
      </Field>
      {state.message && <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-blood"}>{state.message}</p>}
      <button type="submit" disabled={pending} className={buttonClass({ variant: "light", block: true })}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}
      </button>
      <p className="text-xs text-ash">Marking an order as shipped emails the customer their tracking details.</p>
    </form>
  );
}
