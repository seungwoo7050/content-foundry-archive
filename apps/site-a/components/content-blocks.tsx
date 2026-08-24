import type { PublishedContentBlock } from "@content-foundry/content-contract";

import { LegacyContentBlock } from "./legacy-content-block";

export type TextContentBlock = Exclude<
  PublishedContentBlock,
  { type: "embed" | "image" | "table" }
>;

interface ContentBlocksProps {
  blocks: readonly PublishedContentBlock[];
}

export class UnsupportedContentBlockError extends Error {
  readonly code = "CONTENT_BLOCK_UNSUPPORTED";

  constructor(readonly blockType: PublishedContentBlock["type"]) {
    super(`Unsupported content block: ${blockType}`);
    this.name = "UnsupportedContentBlockError";
  }
}

export function ContentBlocks({ blocks }: ContentBlocksProps) {
  return blocks.map((block, index) => {
    if (block.type === "image") {
      throw new UnsupportedContentBlockError(block.type);
    }
    const key = block.type === "heading" ? block.id : `${block.type}-${index}`;
    return <LegacyContentBlock block={block} key={key} />;
  });
}
