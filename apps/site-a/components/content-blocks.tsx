import type { PublishedContentBlock } from "@content-foundry/content-contract";

export type TextContentBlock = Exclude<
  PublishedContentBlock,
  { type: "embed" | "image" | "table" }
>;

interface ContentBlocksProps {
  blocks: readonly TextContentBlock[];
}

const toneLabels = {
  danger: "중요",
  info: "안내",
  tip: "도움말",
  warning: "주의",
} as const;

export function ContentBlocks({ blocks }: ContentBlocksProps) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "heading": {
        const Heading = `h${block.level}` as "h2" | "h3" | "h4" | "h5" | "h6";
        return (
          <Heading id={block.id} key={block.id}>
            {block.text}
          </Heading>
        );
      }
      case "paragraph":
        return <p key={`paragraph-${index}`}>{block.markdown}</p>;
      case "list": {
        const List = block.ordered ? "ol" : "ul";
        return (
          <List key={`list-${index}`}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </List>
        );
      }
      case "quote":
        return (
          <figure key={`quote-${index}`}>
            <blockquote>
              <p>{block.markdown}</p>
            </blockquote>
            {block.attribution ? <figcaption>{block.attribution}</figcaption> : null}
          </figure>
        );
      case "callout":
        return (
          <aside aria-label={toneLabels[block.tone]} data-tone={block.tone} key={`callout-${index}`}>
            <p>{block.markdown}</p>
          </aside>
        );
    }
  });
}
