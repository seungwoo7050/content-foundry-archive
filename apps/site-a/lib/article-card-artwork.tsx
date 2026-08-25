import type { ReactNode } from "react";

import { ImageBlock } from "../components/image-block";
import type { ResponsiveImageAssetRegistry } from "./responsive-image-asset-registry";

const articleCardSizes =
  "(min-width: 64rem) 24rem, (min-width: 48rem) 44vw, 100vw";

export function renderArticleCardArtwork(
  mediaId: string | null,
  mediaAssets: ResponsiveImageAssetRegistry | undefined,
): ReactNode | null {
  if (mediaId === null) return null;
  if (mediaAssets === undefined) {
    throw new Error(`Article card media registry is missing: ${mediaId}`);
  }
  return (
    <ImageBlock
      assets={mediaAssets}
      block={{ type: "image", mediaId }}
      sizes={articleCardSizes}
    />
  );
}
