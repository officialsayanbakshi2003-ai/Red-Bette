"use client";

// Minimal typings and loader for Razorpay Standard Checkout.

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: "INR";
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string; backdrop_color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void; confirm_close?: boolean; escape?: boolean };
  retry?: { enabled: boolean; max_count?: number };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", cb: (response: { error: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let loading: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in a browser"));
  if (window.Razorpay) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error("Could not load the payment window. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return loading;
}

export async function openRazorpay(options: RazorpayOptions, onFailed?: (message: string) => void) {
  await loadRazorpay();
  if (!window.Razorpay) throw new Error("Payment window unavailable.");
  const rzp = new window.Razorpay(options);
  if (onFailed) rzp.on("payment.failed", (r) => onFailed(r.error?.description ?? "Payment failed."));
  rzp.open();
}
