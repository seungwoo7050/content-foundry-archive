import type { PublishedContentBlock } from "@content-foundry/content-contract";

import { ImageBlock, type ResponsiveImageAssetRegistry } from "./image-block";
import { LegacyContentBlock } from "./legacy-content-block";

export type TextContentBlock = Exclude<
  PublishedContentBlock,
  { type: "embed" | "image" | "table" }
>;

interface ContentBlocksProps {
  blocks: readonly PublishedContentBlock[];
  mediaAssets?: ResponsiveImageAssetRegistry;
}

export class UnsupportedContentBlockError extends Error {
  readonly code = "CONTENT_BLOCK_UNSUPPORTED";

  constructor(readonly blockType: PublishedContentBlock["type"]) {
    super(`Unsupported content block: ${blockType}`);
    this.name = "UnsupportedContentBlockError";
  }
}

export function ContentBlocks({ blocks, mediaAssets }: ContentBlocksProps) {
  return blocks.map((block, index) => {
    const key = block.type === "heading" ? block.id : `${block.type}-${index}`;
    if (block.type === "image") {
      if (!mediaAssets) throw new UnsupportedContentBlockError(block.type);
      return <ImageBlock assets={mediaAssets} block={block} key={key} />;
    }
    return <LegacyContentBlock block={block} key={key} />;
  });
}
