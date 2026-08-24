import type {
  PublishedContentBlock,
  PublishedContentBlockV3,
} from "@content-foundry/content-contract";

import { ContentBlocks } from "./content-blocks";
import type { ResponsiveImageAssetRegistry } from "./image-block";
import {
  PublishedContentBlocks,
  type ContentBlockRenderContext,
} from "./published-content-blocks";

export type VersionedContentBlocksProps =
  | {
      readonly contractVersion: "2.0.0";
      readonly blocks: readonly PublishedContentBlock[];
      readonly mediaAssets?: ResponsiveImageAssetRegistry;
    }
  | {
      readonly contractVersion: "3.0.0";
      readonly blocks: readonly PublishedContentBlockV3[];
      readonly context: ContentBlockRenderContext;
    };

export function VersionedContentBlocks(props: VersionedContentBlocksProps) {
  if (props.contractVersion === "2.0.0") {
    return (
      <ContentBlocks
        blocks={props.blocks}
        {...(props.mediaAssets ? { mediaAssets: props.mediaAssets } : {})}
      />
    );
  }
  return <PublishedContentBlocks blocks={props.blocks} context={props.context} />;
}
