import type { PublishedContentBlockV3 } from "@content-foundry/content-contract";

import { ActionLinkBlock } from "./action-link-block";
import { CodeCommandBlock } from "./code-command-block";
import { GalleryBlock } from "./gallery-block";
import { ImageBlock, type ResponsiveImageAssetRegistry } from "./image-block";
import { LegacyContentBlock } from "./legacy-content-block";
import {
  NicheComponentBlock,
  type NicheComponentRegistry,
} from "./niche-component-block";

export interface ContentBlockRenderContext {
  readonly mediaAssets: ResponsiveImageAssetRegistry;
  readonly nicheComponents: NicheComponentRegistry;
  readonly siteId: string;
}

interface PublishedContentBlocksProps {
  readonly blocks: readonly PublishedContentBlockV3[];
  readonly context: ContentBlockRenderContext;
}

export class UnsupportedPublishedContentBlockError extends Error {
  readonly code = "PUBLISHED_CONTENT_BLOCK_UNSUPPORTED";

  constructor(readonly blockType: unknown) {
    super(`Unsupported published content block: ${String(blockType)}`);
    this.name = "UnsupportedPublishedContentBlockError";
  }
}

function assertNever(block: never): never {
  throw new UnsupportedPublishedContentBlockError(
    (block as { readonly type?: unknown }).type,
  );
}

export function PublishedContentBlocks({
  blocks,
  context,
}: PublishedContentBlocksProps) {
  return blocks.map((block, index) => {
    const key = block.type === "heading" ? block.id : `${block.type}-${index}`;
    switch (block.type) {
      case "heading":
      case "paragraph":
      case "list":
      case "quote":
      case "callout":
      case "table":
      case "embed":
        return <LegacyContentBlock block={block} key={key} />;
      case "image":
        return <ImageBlock assets={context.mediaAssets} block={block} key={key} />;
      case "gallery":
        return <GalleryBlock assets={context.mediaAssets} block={block} key={key} />;
      case "code":
      case "command":
        return <CodeCommandBlock block={block} key={key} />;
      case "action-link":
        return <ActionLinkBlock block={block} key={key} />;
      case "niche-component":
        return (
          <NicheComponentBlock
            block={block}
            key={key}
            registry={context.nicheComponents}
            siteId={context.siteId}
          />
        );
      default:
        return assertNever(block);
    }
  });
}
