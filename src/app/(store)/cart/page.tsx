import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/CartPageView";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="display mb-8 text-5xl sm:mb-12 sm:text-6xl">
        Your <span className="text-blood">bag</span>
      </h1>
      <CartPageView />
    </div>
  );
}
