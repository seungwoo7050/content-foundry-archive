import type { ResponsiveImageAssetRegistry } from "./responsive-image-asset-registry";

export interface MetadataContext {
  readonly canonicalOrigin: string;
  readonly config: {
    readonly noindex: boolean;
  };
  readonly mediaAssets?: ResponsiveImageAssetRegistry;
}
