import type { BrandMediaAssets } from "./brand-media-assets";

interface MetadataImage {
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

export interface SiteBrandMetadata {
  readonly favicon: {
    readonly url: string;
    readonly type: string;
    readonly sizes: string;
  } | null;
  readonly socialImage: MetadataImage | null;
}

export function createSiteBrandMetadata(
  canonicalOrigin: string,
  assets: BrandMediaAssets,
): SiteBrandMetadata {
  const favicon = assets.favicon?.fallback;
  const socialImage = assets.socialImage?.fallback;
  return {
    favicon: favicon
      ? {
          url: new URL(favicon.publicPath, canonicalOrigin).href,
          type: favicon.mimeType,
          sizes: `${favicon.width}x${favicon.height}`,
        }
      : null,
    socialImage: socialImage
      ? {
          url: new URL(socialImage.publicPath, canonicalOrigin).href,
          width: socialImage.width,
          height: socialImage.height,
          alt: socialImage.alt,
        }
      : null,
  };
}
