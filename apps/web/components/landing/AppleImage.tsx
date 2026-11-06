/**
 * Фото-яблоки в трёх состояниях. Все кадры - квадратные, с прозрачным
 * фоном и одинаковой композицией, поэтому подмена не вызывает прыжка.
 * `srcset` отдаёт Retina-размер там, где он реально нужен.
 */
export const APPLE_VARIANTS = ["whole", "bitten", "cracked"] as const;

export type AppleVariant = (typeof APPLE_VARIANTS)[number];

const WIDTHS: Record<AppleVariant, readonly number[]> = {
  whole: [320, 640, 960, 1268],
  bitten: [320, 640, 720],
  cracked: [320, 640, 960, 1254],
};

type AppleImageProps = {
  variant: AppleVariant;
  /** CSS `sizes` - сколько места картинка занимает на экране. */
  sizes: string;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  fetchPriority?: "high" | "low" | "auto";
  draggable?: boolean;
};

export function AppleImage({
  variant,
  sizes,
  className,
  alt = "",
  width = 640,
  height = 640,
  fetchPriority,
  draggable = false,
}: AppleImageProps) {
  const widths = WIDTHS[variant];
  const fallback = widths[Math.min(1, widths.length - 1)] ?? 640;
  const srcSet = widths
    .map((width) => `/assets/apple-${variant}-${width}.webp ${width}w`)
    .join(", ");

  return (
    <img
      src={`/assets/apple-${variant}-${fallback}.webp`}
      srcSet={srcSet}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      fetchPriority={fetchPriority}
      draggable={draggable}
      className={className}
    />
  );
}
