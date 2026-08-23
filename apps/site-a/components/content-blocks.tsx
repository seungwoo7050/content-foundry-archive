import type { PublishedContentBlock } from "@content-foundry/content-contract";

export type TextContentBlock = Extract<
  PublishedContentBlock,
  { type: "heading" | "paragraph" | "list" | "quote" }
>;

interface ContentBlocksProps {
  blocks: readonly TextContentBlock[];
}

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
    }
  });
}
