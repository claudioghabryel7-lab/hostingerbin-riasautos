"use client";

import Image, { type ImageProps } from "next/image";

/** Suporta data URL do Firestore e paths locais. */
export function DbImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  priority,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}) {
  if (src?.startsWith("data:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        className={
          fill
            ? `absolute inset-0 h-full w-full object-cover ${className || ""}`
            : className
        }
        style={fill ? undefined : { width, height }}
      />
    );
  }

  const props: ImageProps = fill
    ? {
        src,
        alt,
        fill: true,
        className,
        priority,
        sizes,
      }
    : {
        src,
        alt,
        width: width || 48,
        height: height || 48,
        className,
        priority,
      };

  return <Image {...props} />;
}
