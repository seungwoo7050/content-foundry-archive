import type { ResponsiveImageAssetRegistry } from "../components/image-block";
import { ImageBlock } from "../components/image-block";

export function renderArticleHero(
  mediaId: string | null,
  mediaAssets: ResponsiveImageAssetRegistry,
) {
  return mediaId === null ? null : (
    <ImageBlock
      assets={mediaAssets}
      block={{ type: "image", mediaId }}
      priority
    />
  );
}
