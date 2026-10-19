import type { ImgHTMLAttributes } from "react";
import images from "@/lib/image-manifest.json";

type Variant = {
  width: number;
  height: number;
  sources: { src: string; width: number }[];
};
const manifest: Record<string, Variant> = images;
export function imageDimensions(src: string) {
  const key = src.replace(/^https:\/\/lopessignature\.vercel\.app/, "");
  return manifest[key];
}
export function ResponsiveImage({
  src,
  srcSet,
  sizes,
  width,
  height,
  decoding = "async",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  let key = src || "";
  if (key.startsWith("https://lopessignature.vercel.app/"))
    key = key.slice("https://lopessignature.vercel.app".length);
  try {
    key = decodeURI(key);
  } catch {
    /* Keep the original URL if malformed. */
  }
  const image = manifest[key];
  return (
    <img
      {...props}
      src={image?.sources.at(-1)?.src || src}
      decoding={decoding}
      srcSet={
        srcSet ||
        image?.sources.map((item) => `${item.src} ${item.width}w`).join(", ")
      }
      sizes={
        sizes ||
        (image
          ? "(max-width: 620px) 90vw, (max-width: 1024px) 50vw, 960px"
          : undefined)
      }
      width={width ?? image?.width}
      height={height ?? image?.height}
    />
  );
}
