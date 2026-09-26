"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonClass } from "@/components/ui/button";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display mt-4 text-5xl sm:text-6xl">
        Choppy <span className="text-blood">waters.</span>
      </h1>
      <p className="mt-4 max-w-md text-sm text-mist">
        We hit a snag loading this page. Please try again. If it keeps happening, email us and we&apos;ll sort it out.
      </p>
      {error.digest && <p className="mt-2 text-xs text-ash">Reference: {error.digest}</p>}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className={buttonClass({ size: "lg" })}>
          Try again
        </button>
        <Link href="/" className={buttonClass({ variant: "outline", size: "lg" })}>
          Back home
        </Link>
      </div>
    </div>
  );
}
