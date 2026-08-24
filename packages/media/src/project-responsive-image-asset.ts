import {
  projectStaticImageAsset,
  type ImageProjectionSource,
  type StaticImageAsset,
} from "./project-static-image-asset.js";

export const RESPONSIVE_WEBP_QUALITY = 82;
const TARGET_WIDTHS = [480, 960, 1440] as const;

export interface ResponsiveImageDerivative {
  readonly relativePath: string;
  readonly publicPath: string;
  readonly mimeType: "image/webp";
  readonly width: number;
  readonly height: number;
}

export interface ResponsiveImageAsset {
  readonly fallback: StaticImageAsset;
  readonly derivatives: readonly ResponsiveImageDerivative[];
}

export function projectResponsiveImageAsset(
  source: ImageProjectionSource,
  recordPath: string,
): ResponsiveImageAsset {
  const fallback = projectStaticImageAsset(source, recordPath);
  const widths = [...TARGET_WIDTHS.filter((width) => width < source.width), source.width];
  const derivatives = widths.map((width) => {
    const relativePath = `_media/${source.media.sha256}/webp-q${RESPONSIVE_WEBP_QUALITY}/${width}w.webp`;
    return {
      relativePath,
      publicPath: `/${relativePath}`,
      mimeType: "image/webp" as const,
      width,
      height: Math.max(1, Math.round((source.height * width) / source.width)),
    };
  });
  return { fallback, derivatives };
}
