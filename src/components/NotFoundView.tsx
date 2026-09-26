import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export function NotFoundView() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="display text-[28vw] leading-none text-blood sm:text-[12rem]">404</p>
      <h1 className="display mt-4 text-4xl sm:text-6xl">Page not found</h1>
      <p className="mt-4 max-w-md text-sm text-mist">
        The page you&apos;re looking for has moved, sold out or never existed. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/shop" className={buttonClass({ size: "lg" })}>
          Shop the drop
        </Link>
        <Link href="/" className={buttonClass({ variant: "outline", size: "lg" })}>
          Back home
        </Link>
      </div>
    </div>
  );
}
