import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonClass } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { productCardSelect } from "@/lib/catalog";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const user = await requireUser("/wishlist");
  const items = await db.wishlistItem.findMany({
    where: { userId: user.id, product: { isActive: true } },
    orderBy: { createdAt: "desc" },
    select: { product: { select: productCardSelect } },
  });
  return (
    <div className="container-x py-10 sm:py-14">
      <p className="eyebrow">Saved for later</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">
        Wish<span className="text-blood">list</span>
      </h1>
      {items.length === 0 ? (
        <div className="mt-10 border border-dashed border-line p-10 text-center">
          <p className="text-sm text-mist">Nothing saved yet. Tap the heart on any product to keep it here.</p>
          <Link href="/shop" className={buttonClass({ variant: "light", className: "mt-6" })}>
            Browse the drop
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {items.map(({ product }) => (
            <ProductCard key={product.id} product={product} wishlisted />
          ))}
        </div>
      )}
    </div>
  );
}
