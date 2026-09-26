"use client";

import { clsx } from "clsx";
import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleWishlist } from "@/actions/wishlist";
import { toast } from "@/store/toast";

export function WishlistButton({
  productId,
  initial,
  className,
  variant = "icon",
}: {
  productId: string;
  initial: boolean;
  className?: string;
  variant?: "icon" | "full";
}) {
  const [wishlisted, setWishlisted] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const onClick = () => {
    startTransition(async () => {
      const previous = wishlisted;
      setWishlisted(!previous);
      const res = await toggleWishlist(productId);
      if (!res.ok) {
        setWishlisted(previous);
        if (res.reason === "auth") {
          toast("Sign in to save favourites.");
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
        } else {
          toast("Something went wrong. Please try again.", "error");
        }
        return;
      }
      setWishlisted(res.wishlisted);
      toast(res.wishlisted ? "Saved to your wishlist" : "Removed from your wishlist", "success");
    });
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={wishlisted}
        className={clsx(
          "inline-flex h-14 w-14 shrink-0 items-center justify-center border border-line transition-colors hover:border-bone",
          className,
        )}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={clsx("size-5", wishlisted && "fill-blood text-blood")} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={clsx(
        "z-10 grid size-9 place-items-center rounded-full bg-ink/60 backdrop-blur transition-colors hover:bg-ink",
        className,
      )}
    >
      <Heart className={clsx("size-4 transition-colors", wishlisted ? "fill-blood text-blood" : "text-bone")} />
    </button>
  );
}
