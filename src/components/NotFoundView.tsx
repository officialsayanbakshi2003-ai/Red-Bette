import Link from "next/link";
import Image from "next/image";
import { buttonClass } from "@/components/ui/button";

export function NotFoundView() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6 size-40 sm:size-52">
        <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff3b3b_0%,#c3121a_45%,#5c0508_100%)]" />
        <Image src="/brand/mark-dark.svg" alt="" fill unoptimized className="object-contain" />
      </div>
      <p className="eyebrow">Error 404</p>
      <h1 className="display mt-4 text-5xl sm:text-7xl">
        Lost in the <span className="text-blood">current.</span>
      </h1>
      <p className="mt-4 max-w-md text-sm text-mist">
        The page you&apos;re looking for swam off somewhere. It may have moved, sold out or never existed.
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
