import type { ResponsiveImageAsset } from "@content-foundry/media";

import type { ResponsiveImageAssetRegistry } from "./responsive-image-asset-registry";

export interface BrandPresentationSource {
  readonly release: { readonly contractVersion: string };
  readonly presentation?: {
    readonly brand: {
      readonly logoMediaId: string | null;
      readonly faviconMediaId: string | null;
      readonly socialImageMediaId: string | null;
    };
  };
}

export interface BrandMediaAssets {
  readonly logo: ResponsiveImageAsset | null;
  readonly favicon: ResponsiveImageAsset | null;
  readonly socialImage: ResponsiveImageAsset | null;
}

function resolveBrandAsset(
  mediaId: string | null,
  slot: string,
  mediaAssets: ResponsiveImageAssetRegistry,
): ResponsiveImageAsset | null {
  if (mediaId === null) return null;
  const asset = mediaAssets.get(mediaId);
  if (asset === undefined) {
    throw new Error(`Prepared ${slot} brand asset is missing: ${mediaId}`);
  }
  return asset;
}

export function resolveBrandMediaAssets(
  source: BrandPresentationSource,
  mediaAssets: ResponsiveImageAssetRegistry,
): BrandMediaAssets {
  const brand = source.presentation?.brand;
  if (brand === undefined) {
    return { logo: null, favicon: null, socialImage: null };
  }
  return {
    logo: resolveBrandAsset(brand.logoMediaId, "logo", mediaAssets),
    favicon: resolveBrandAsset(brand.faviconMediaId, "favicon", mediaAssets),
    socialImage: resolveBrandAsset(
      brand.socialImageMediaId,
      "social image",
      mediaAssets,
    ),
  };
}
