import type { PublishedGalleryBlockV3 } from "@content-foundry/content-contract";

import {
  ImageBlock,
  type ResponsiveImageAssetRegistry,
} from "./image-block";

interface GalleryBlockProps {
  readonly block: PublishedGalleryBlockV3;
  readonly assets: ResponsiveImageAssetRegistry;
}

export function GalleryBlock({ block, assets }: GalleryBlockProps) {
  return (
    <figure className="content-gallery">
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      <div className="content-gallery-items">
        {block.items.map((item, index) => (
          <ImageBlock
            assets={assets}
            block={{
              type: "image",
              mediaId: item.mediaId,
              ...(item.caption === undefined ? {} : { caption: item.caption }),
            }}
            key={`${item.mediaId}-${index}`}
          />
        ))}
      </div>
    </figure>
  );
}
