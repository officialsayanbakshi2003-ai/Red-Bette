import Image, { type ImageProps } from "next/image";

const OPTIMIZABLE = [/^\/(?!.*\.svg$)/, /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//];

/**
 * next/image wrapper: optimises our own and Vercel Blob images, and serves
 * SVGs and any other remote URL an admin pasted as-is.
 */
export function ProductImage(props: Omit<ImageProps, "src"> & { src: string | null | undefined }) {
  const { src, alt, ...rest } = props;
  const finalSrc = src || "/brand/mark.svg";
  const optimizable = OPTIMIZABLE.some((re) => re.test(finalSrc));
  return <Image {...rest} src={finalSrc} alt={alt} unoptimized={!optimizable} />;
}
