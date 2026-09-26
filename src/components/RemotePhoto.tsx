"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/media";

// Pexels' CDN resizes on the fly, so its images are served at the exact width
// each device needs without going through the Next.js image optimiser.
const BLOB = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//;

function pexelsLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("auto", "compress");
  url.searchParams.set("cs", "tinysrgb");
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  return url.toString();
}

export function RemotePhoto({
  photo,
  className,
  sizes = "100vw",
  priority = false,
  fallbackClassName,
}: {
  photo: Photo;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // onError can fire before hydration; catch images that already failed.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return <Image src={photo.fallback} alt={photo.alt} fill unoptimized className={fallbackClassName ?? className} />;
  }
  const isPexels = photo.src.startsWith("https://images.pexels.com/");
  const optimizable = !isPexels && (/^\/(?!.*\.svg$)/.test(photo.src) || BLOB.test(photo.src));
  return (
    <Image
      ref={ref}
      src={photo.src}
      alt={photo.alt}
      fill
      sizes={sizes}
      priority={priority}
      loader={isPexels ? pexelsLoader : undefined}
      unoptimized={!isPexels && !optimizable}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
