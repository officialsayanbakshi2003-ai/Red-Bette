"use client";

import { clsx } from "clsx";
import { ChevronDown, Loader2, Lock, ShieldCheck, Tag, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { previewCoupon, type CouponPreview } from "@/actions/checkout";
import { hasBlockingIssues, useCartSync } from "@/components/cart/useCartSync";
import { Field } from "@/components/forms/Field";
import { ProductImage } from "@/components/product/ProductImage";
import { Sheet } from "@/components/ui/Sheet";
import { buttonClass } from "@/components/ui/button";
import { commerce, siteConfig, sizeLabel } from "@/lib/config";
import { INDIAN_STATES } from "@/lib/india";
import { formatINR } from "@/lib/money";
import { checkCoupon, computeDiscount, computeSubtotal, computeTotals, isCodAllowed, type PaymentMethodCode } from "@/lib/pricing";
import { useCart } from "@/store/cart";
import { openRazorpay } from "./razorpay";

export interface SavedAddressOption {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

interface AddressFields {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
}

interface PlacedOrder {
  orderId: string;
  orderNumber: string;
  accessToken: string;
  total: number;
  paymentMethod: "RAZORPAY" | "COD";
  razorpay?: { keyId: string; orderId: string; amount: number };
  demo?: boolean;
}

const EMPTY_ADDRESS: AddressFields = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "" };

const toFields = (a: SavedAddressOption): AddressFields => ({
  fullName: a.fullName,
  phone: a.phone,
  line1: a.line1,
  line2: a.line2 ?? "",
  city: a.city,
  state: a.state,
  postalCode: a.postalCode,
});

export function CheckoutForm({
  user,
  addresses,
  onlinePayments,
  demoPayments,
}: {
  user: { name: string; email: string; phone: string | null } | null;
  addresses: SavedAddressOption[];
  onlinePayments: boolean;
  demoPayments: boolean;
}) {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const hydrated = useCart((s) => s.hydrated);
  const storedCoupon = useCart((s) => s.couponCode);
  const setStoredCoupon = useCart((s) => s.setCoupon);
  const clearCart = useCart((s) => s.clear);
  const { syncing, changed, sync } = useCartSync(true);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [addressId, setAddressId] = useState<string | "new">(defaultAddress?.id ?? "new");
  const [address, setAddress] = useState<AddressFields>(
    defaultAddress ? toFields(defaultAddress) : { ...EMPTY_ADDRESS, fullName: user?.name ?? "", phone: user?.phone ?? "" },
  );
  const [email, setEmail] = useState(user?.email ?? "");
  const [saveAddress, setSaveAddress] = useState(true);
  const [chosenMethod, setMethod] = useState<PaymentMethodCode>(onlinePayments ? "RAZORPAY" : "COD");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Extract<CouponPreview, { ok: true }> | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingOrder, setPending] = useState<{ order: PlacedOrder; bagKey: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const subtotal = computeSubtotal(lines);
  const couponRule = coupon
    ? { code: coupon.code, type: coupon.type, value: coupon.value, minSubtotal: coupon.minSubtotal, maxDiscount: coupon.maxDiscount }
    : null;
  const couponStillValid = couponRule ? checkCoupon(couponRule, subtotal) : null;
  const activeCoupon = couponRule && couponStillValid?.ok ? couponRule : null;
  const codAllowed = isCodAllowed(subtotal - computeDiscount(activeCoupon, subtotal));
  // COD can become unavailable when the bag grows; fall back to online payment.
  const method: PaymentMethodCode = chosenMethod === "COD" && !codAllowed && onlinePayments ? "RAZORPAY" : chosenMethod;
  const totals = useMemo(() => computeTotals(lines, activeCoupon, method), [lines, activeCoupon, method]);
  // A pending payment belongs to the bag as it was; editing the bag starts a fresh order.
  const bagKey = lines.map((l) => `${l.variantId}:${l.quantity}`).join("|");
  const pending = pendingOrder && pendingOrder.bagKey === bagKey ? pendingOrder.order : null;
  const blocked = hasBlockingIssues(lines);
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);

  // Re-apply a coupon remembered from an earlier visit.
  useEffect(() => {
    if (!hydrated || !storedCoupon || coupon || subtotal <= 0) return;
    const timer = setTimeout(() => void applyCoupon(storedCoupon, true), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function applyCoupon(code: string, silent = false) {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await previewCoupon(trimmed, subtotal);
      if (res.ok) {
        setCoupon(res);
        setStoredCoupon(res.code);
        setCouponInput("");
      } else {
        if (!silent) setCouponError(res.message);
        setStoredCoupon(null);
      }
    } catch {
      if (!silent) setCouponError("Could not check this coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  const update = (key: keyof AddressFields, value: string) => {
    setAddress((a) => ({ ...a, [key]: value }));
    if (errors[`address.${key}`]) setErrors((e) => ({ ...e, [`address.${key}`]: "" }));
  };

  async function goToOrder(order: PlacedOrder) {
    clearCart();
    router.push(`/orders/${order.orderId}?token=${encodeURIComponent(order.accessToken)}&placed=1`);
  }

  async function startOnlinePayment(order: PlacedOrder) {
    if (order.demo) {
      setDemoOpen(true);
      return;
    }
    if (!order.razorpay) return;
    setNotice(null);
    try {
      await openRazorpay(
        {
          key: order.razorpay.keyId,
          amount: order.razorpay.amount,
          currency: "INR",
          name: siteConfig.name,
          description: `Order ${order.orderNumber}`,
          order_id: order.razorpay.orderId,
          prefill: { name: address.fullName, email, contact: address.phone },
          notes: { orderNumber: order.orderNumber },
          theme: { color: "#e3141b", backdrop_color: "#0a0a0b" },
          retry: { enabled: true, max_count: 3 },
          modal: {
            confirm_close: true,
            ondismiss: () =>
              setNotice(
                `Payment was not completed. Your items are reserved for ${commerce.pendingOrderTtlMinutes} minutes. You can try again below.`,
              ),
          },
          handler: async (response) => {
            setSubmitting(true);
            try {
              const res = await fetch("/api/payments/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.orderId, ...response }),
              });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(
                  data.error ??
                    "We received your payment but could not confirm it yet. Don't pay again. We'll email you shortly.",
                );
                setSubmitting(false);
                return;
              }
              await goToOrder(order);
            } catch {
              setError("Network error while confirming payment. Don't pay again. Check your email or your account for the order.");
              setSubmitting(false);
            }
          },
        },
        (message) => setNotice(message),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open the payment window.");
    }
  }

  async function completeDemoPayment() {
    if (!pending) return;
    setSubmitting(true);
    const res = await fetch("/api/payments/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: pending.orderId, accessToken: pending.accessToken }),
    });
    if (!res.ok) {
      setSubmitting(false);
      setDemoOpen(false);
      setError("Demo payment failed.");
      return;
    }
    await goToOrder(pending);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setErrors({});
    setNotice(null);

    if (pending && method === "RAZORPAY" && pending.paymentMethod === "RAZORPAY") {
      await startOnlinePayment(pending);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          address: { ...address, line2: address.line2 || undefined },
          items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
          couponCode: activeCoupon?.code,
          paymentMethod: method,
          saveAddress: !!user && addressId === "new" && saveAddress,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not place your order. Please try again.");
        if (data.errors) setErrors(data.errors);
        if (res.status === 409) void sync();
        if (data.errors) document.getElementById("checkout-top")?.scrollIntoView({ behavior: "smooth" });
        setSubmitting(false);
        return;
      }
      const order = data as PlacedOrder;
      if (order.paymentMethod === "COD") {
        await goToOrder(order);
        return;
      }
      setPending({ order, bagKey });
      setSubmitting(false);
      await startOnlinePayment(order);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-mist" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-5 text-center">
        <p className="display text-4xl">Your bag is empty</p>
        <p className="text-sm text-mist">Add something you love and come back here to check out.</p>
        <Link href="/shop" className={buttonClass({ variant: "light" })}>
          Shop the drop
        </Link>
      </div>
    );
  }

  const summary = (
    <div className="space-y-5">
      <ul className="divide-y divide-line">
        {lines.map((l) => (
          <li key={l.variantId} className="flex gap-3 py-3">
            <div className="relative aspect-[4/5] w-16 shrink-0 bg-char">
              <ProductImage src={l.image} alt={l.name} fill sizes="64px" className="object-cover" />
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-mist text-[0.65rem] font-bold text-ink">
                {l.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{l.name}</p>
              <p className="text-xs text-mist">
                {l.color} · {sizeLabel(l.size)}
              </p>
              {l.maxQuantity <= 0 && <p className="text-xs text-blood">Sold out. Remove it from your bag.</p>}
            </div>
            <p className="text-sm tabular-nums">{formatINR(l.unitPrice * l.quantity)}</p>
          </li>
        ))}
      </ul>

      {/* Coupon */}
      <div>
        {coupon ? (
          <div className="flex items-center justify-between gap-3 border border-dashed border-emerald-400/40 px-3 py-2.5">
            <p className="flex min-w-0 items-center gap-2 text-sm">
              <Tag className="size-4 shrink-0 text-emerald-400" />
              <span className="font-semibold">{coupon.code}</span>
              <span className="truncate text-xs text-mist">{coupon.description}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setCoupon(null);
                setStoredCoupon(null);
              }}
              className="text-mist hover:text-bone"
              aria-label="Remove coupon"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <label htmlFor="coupon" className="sr-only">
              Coupon code
            </label>
            <input
              id="coupon"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void applyCoupon(couponInput);
                }
              }}
              placeholder="Coupon code"
              maxLength={32}
              className="field uppercase"
            />
            <button
              type="button"
              onClick={() => applyCoupon(couponInput)}
              disabled={couponLoading || !couponInput.trim()}
              className={buttonClass({ variant: "outline", className: "h-auto shrink-0" })}
            >
              {couponLoading ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
            </button>
          </div>
        )}
        {couponError && <p className="mt-2 text-xs text-blood">{couponError}</p>}
        {couponStillValid && !couponStillValid.ok && <p className="mt-2 text-xs text-blood">{couponStillValid.reason}</p>}
      </div>

      <dl className="space-y-2.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-mist">Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</dt>
          <dd className="tabular-nums">{formatINR(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <dt>Discount ({activeCoupon?.code})</dt>
            <dd className="tabular-nums">−{formatINR(totals.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-mist">Shipping</dt>
          <dd className="tabular-nums">{totals.shipping === 0 ? "Free" : formatINR(totals.shipping)}</dd>
        </div>
        {totals.codFee > 0 && (
          <div className="flex justify-between">
            <dt className="text-mist">Cash on delivery fee</dt>
            <dd className="tabular-nums">{formatINR(totals.codFee)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <dt className="font-display text-sm font-semibold uppercase tracking-[0.15em]">Total</dt>
          <dd className="font-display text-2xl font-bold tabular-nums">{formatINR(totals.total)}</dd>
        </div>
        <p className="text-xs text-ash">Inclusive of all taxes.</p>
      </dl>
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14" id="checkout-top">
      <aside className="order-first lg:order-last lg:col-span-5">
        <div className="border-y border-line lg:sticky lg:top-24 lg:border lg:bg-coal lg:p-6">
          <button
            type="button"
            onClick={() => setSummaryOpen((o) => !o)}
            className="flex w-full items-center justify-between py-4 text-sm lg:hidden"
            aria-expanded={summaryOpen}
            aria-controls="order-summary"
          >
            <span className="flex items-center gap-2">
              {summaryOpen ? "Hide" : "Show"} order summary
              <ChevronDown className={clsx("size-4 transition-transform", summaryOpen && "rotate-180")} />
            </span>
            <span className="font-display text-lg font-bold tabular-nums">{formatINR(totals.total)}</span>
          </button>
          <h2 className="mb-2 hidden font-display text-lg font-semibold uppercase tracking-[0.15em] lg:block">Order summary</h2>
          <div id="order-summary" className={clsx(summaryOpen ? "block pb-6" : "hidden", "lg:block lg:pb-0")}>
            {summary}
          </div>
        </div>
      </aside>

      <div className="space-y-10 lg:col-span-7">
        {changed && (
          <p className="border border-blood/40 bg-blood/10 px-4 py-3 text-sm">
            Some prices or stock levels changed since you added them. Please review your order.
          </p>
        )}

        <section aria-labelledby="contact-title">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="contact-title" className="font-display text-lg font-semibold uppercase tracking-[0.15em]">
              Contact
            </h2>
            {!user && (
              <Link href="/login?next=/checkout" className="text-xs text-mist underline underline-offset-4 hover:text-bone">
                Have an account? Sign in
              </Link>
            )}
          </div>
          <Field label="Email for order updates" name="email" error={errors.email}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="field"
              aria-invalid={!!errors.email}
            />
          </Field>
        </section>

        <section aria-labelledby="ship-title">
          <h2 id="ship-title" className="mb-5 font-display text-lg font-semibold uppercase tracking-[0.15em]">
            Shipping address
          </h2>

          {addresses.length > 0 && (
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={clsx(
                    "flex cursor-pointer gap-3 border p-4 text-sm transition-colors",
                    addressId === a.id ? "border-bone" : "border-line hover:border-bone/50",
                  )}
                >
                  <input
                    type="radio"
                    name="saved-address"
                    checked={addressId === a.id}
                    onChange={() => {
                      setAddressId(a.id);
                      setAddress(toFields(a));
                      setErrors({});
                    }}
                    className="mt-1 accent-[#e3141b]"
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold">{a.fullName}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-mist">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postalCode}
                    </span>
                  </span>
                </label>
              ))}
              <label
                className={clsx(
                  "flex cursor-pointer items-center gap-3 border p-4 text-sm transition-colors",
                  addressId === "new" ? "border-bone" : "border-line hover:border-bone/50",
                )}
              >
                <input
                  type="radio"
                  name="saved-address"
                  checked={addressId === "new"}
                  onChange={() => {
                    setAddressId("new");
                    setAddress({ ...EMPTY_ADDRESS, fullName: user?.name ?? "", phone: user?.phone ?? "" });
                  }}
                  className="accent-[#e3141b]"
                />
                Use a new address
              </label>
            </div>
          )}

          <div className={clsx("grid gap-5 sm:grid-cols-2", addressId !== "new" && "hidden")}>
            <Field label="Full name" name="fullName" error={errors["address.fullName"]}>
              <input id="fullName" value={address.fullName} onChange={(e) => update("fullName", e.target.value)} autoComplete="name" maxLength={80} className="field" aria-invalid={!!errors["address.fullName"]} />
            </Field>
            <Field label="Mobile number" name="phone" error={errors["address.phone"]} hint="For delivery updates">
              <input id="phone" type="tel" inputMode="numeric" value={address.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel-national" maxLength={14} className="field" aria-invalid={!!errors["address.phone"]} />
            </Field>
            <Field label="House / flat, street" name="line1" error={errors["address.line1"]} className="sm:col-span-2">
              <input id="line1" value={address.line1} onChange={(e) => update("line1", e.target.value)} autoComplete="address-line1" maxLength={160} className="field" aria-invalid={!!errors["address.line1"]} />
            </Field>
            <Field label="Area, landmark" name="line2" error={errors["address.line2"]} className="sm:col-span-2" optional>
              <input id="line2" value={address.line2} onChange={(e) => update("line2", e.target.value)} autoComplete="address-line2" maxLength={160} className="field" />
            </Field>
            <Field label="City" name="city" error={errors["address.city"]}>
              <input id="city" value={address.city} onChange={(e) => update("city", e.target.value)} autoComplete="address-level2" maxLength={80} className="field" aria-invalid={!!errors["address.city"]} />
            </Field>
            <Field label="PIN code" name="postalCode" error={errors["address.postalCode"]}>
              <input id="postalCode" inputMode="numeric" value={address.postalCode} onChange={(e) => update("postalCode", e.target.value.replace(/\D/g, "").slice(0, 6))} autoComplete="postal-code" maxLength={6} className="field" aria-invalid={!!errors["address.postalCode"]} />
            </Field>
            <Field label="State" name="state" error={errors["address.state"]} className="sm:col-span-2">
              <select id="state" value={address.state} onChange={(e) => update("state", e.target.value)} autoComplete="address-level1" className="field" aria-invalid={!!errors["address.state"]}>
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
            {user && (
              <label className="flex items-center gap-3 text-sm text-mist sm:col-span-2">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="size-4 accent-[#e3141b]" />
                Save this address to my account
              </label>
            )}
          </div>
          {addressId !== "new" && Object.keys(errors).some((k) => k.startsWith("address.")) && (
            <p className="mt-3 text-xs text-blood">
              This saved address is incomplete.{" "}
              <button type="button" className="underline" onClick={() => setAddressId("new")}>
                Edit it as a new address
              </button>
              .
            </p>
          )}
        </section>

        <section aria-labelledby="pay-title">
          <h2 id="pay-title" className="mb-5 font-display text-lg font-semibold uppercase tracking-[0.15em]">
            Payment
          </h2>
          <div className="divide-y divide-line border border-line">
            <label className={clsx("flex cursor-pointer items-start gap-3 p-4", !onlinePayments && "cursor-not-allowed opacity-50")}>
              <input
                type="radio"
                name="payment"
                value="RAZORPAY"
                checked={method === "RAZORPAY"}
                disabled={!onlinePayments}
                onChange={() => setMethod("RAZORPAY")}
                className="mt-1 accent-[#e3141b]"
              />
              <span>
                <span className="block text-sm font-semibold">
                  Pay online {demoPayments && <span className="ml-1 text-xs font-normal text-amber-300">(demo mode)</span>}
                </span>
                <span className="mt-1 block text-xs text-mist">UPI, cards, net banking and wallets. Secured by Razorpay.</span>
                {!onlinePayments && <span className="mt-1 block text-xs text-blood">Online payment is unavailable right now.</span>}
              </span>
            </label>
            <label className={clsx("flex cursor-pointer items-start gap-3 p-4", !codAllowed && "cursor-not-allowed opacity-50")}>
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={method === "COD"}
                disabled={!codAllowed}
                onChange={() => setMethod("COD")}
                className="mt-1 accent-[#e3141b]"
              />
              <span>
                <span className="block text-sm font-semibold">Cash on delivery</span>
                <span className="mt-1 block text-xs text-mist">
                  {codAllowed
                    ? `Pay when your order arrives. A ${formatINR(commerce.codFee)} handling fee applies.`
                    : `Available on orders up to ${formatINR(commerce.codMaxOrderValue)}.`}
                </span>
              </span>
            </label>
          </div>
        </section>

        {notice && <p className="border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm">{notice}</p>}
        {error && (
          <p role="alert" className="border border-blood/50 bg-blood/10 px-4 py-3 text-sm">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={submitting || syncing || blocked || (method === "COD" && !codAllowed)}
            className={buttonClass({ size: "lg", block: true, className: "h-16" })}
          >
            {submitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <Lock className="size-4" />
                {method === "COD"
                  ? `Place order · ${formatINR(totals.total)}`
                  : pending
                    ? `Retry payment · ${formatINR(pending.total)}`
                    : `Pay ${formatINR(totals.total)}`}
              </>
            )}
          </button>
          {blocked && <p className="text-center text-xs text-blood">Remove sold-out items from your bag to continue.</p>}
          <p className="flex items-center justify-center gap-2 text-xs text-ash">
            <ShieldCheck className="size-3.5" /> Your payment details are handled securely by Razorpay. We never see your card.
          </p>
        </div>
      </div>


      <Sheet open={demoOpen} onClose={() => !submitting && setDemoOpen(false)} title="Demo payment">
        <div className="flex flex-1 flex-col gap-5 px-5 py-6">
          <p className="text-sm text-mist">
            Razorpay keys are not configured, so this local build uses a simulated payment. Add{" "}
            <code className="text-bone">RAZORPAY_KEY_ID</code> and <code className="text-bone">RAZORPAY_KEY_SECRET</code> to
            take real payments. Demo payments are always disabled in production.
          </p>
          <p className="font-display text-3xl font-bold">{pending ? formatINR(pending.total) : ""}</p>
          <button type="button" onClick={completeDemoPayment} disabled={submitting} className={buttonClass({ size: "lg", block: true })}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : "Simulate successful payment"}
          </button>
          <button type="button" onClick={() => setDemoOpen(false)} disabled={submitting} className={buttonClass({ variant: "outline", block: true })}>
            Cancel
          </button>
        </div>
      </Sheet>
    </form>
  );
}
