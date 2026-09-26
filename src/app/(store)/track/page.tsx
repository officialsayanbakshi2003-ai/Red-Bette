import type { Metadata } from "next";
import Link from "next/link";
import { TrackOrderForm } from "@/components/forms/TrackOrderForm";

export const metadata: Metadata = { title: "Track your order", robots: { index: false } };

export default function TrackPage() {
  return (
    <div className="container-x py-12 sm:py-20">
      <div className="mx-auto max-w-md">
        <p className="eyebrow">Order status</p>
        <h1 className="display mt-3 text-5xl">
          Track your <span className="text-blood">order</span>
        </h1>
        <p className="mt-3 text-sm text-mist">
          Enter your order number and the email you used at checkout. Have an account?{" "}
          <Link href="/account/orders" className="text-bone underline underline-offset-4">
            See all your orders
          </Link>
          .
        </p>
        <div className="mt-8">
          <TrackOrderForm />
        </div>
      </div>
    </div>
  );
}
