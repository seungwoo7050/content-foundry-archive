import type { PublishedContentBlockV3 } from "@content-foundry/content-contract";

export type LegacyContentBlockValue = Extract<
  PublishedContentBlockV3,
  {
    type:
      | "heading"
      | "paragraph"
      | "list"
      | "quote"
      | "callout"
      | "table"
      | "embed";
  }
>;

interface LegacyContentBlockProps {
  readonly block: LegacyContentBlockValue;
}

const toneLabels = {
  danger: "중요",
  info: "안내",
  tip: "도움말",
  warning: "주의",
} as const;

function assertExternalHttpUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Unsafe embed URL protocol: ${url.protocol}`);
  }
}

export function LegacyContentBlock({ block }: LegacyContentBlockProps) {
  switch (block.type) {
    case "heading": {
      const Heading = `h${block.level}` as "h2" | "h3" | "h4" | "h5" | "h6";
      return <Heading id={block.id}>{block.text}</Heading>;
    }
    case "paragraph":
      return <p>{block.markdown}</p>;
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{item}</li>
          ))}
        </List>
      );
    }
    case "quote":
      return (
        <figure>
          <blockquote>
            <p>{block.markdown}</p>
          </blockquote>
          {block.attribution ? <figcaption>{block.attribution}</figcaption> : null}
        </figure>
      );
    case "callout":
      return (
        <aside aria-label={toneLabels[block.tone]} data-tone={block.tone}>
          <p>{block.markdown}</p>
        </aside>
      );
    case "table":
      return (
        <div className="content-table-scroll">
          <table>
            {block.caption ? <caption>{block.caption}</caption> : null}
            <thead>
              <tr>
                {block.columns.map((column, columnIndex) => (
                  <th key={columnIndex} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "embed":
      assertExternalHttpUrl(block.url);
      return (
        <p className="content-embed">
          <a href={block.url} rel="noreferrer noopener" target="_blank">
            {block.provider}에서 원본 보기 (새 창)
          </a>
        </p>
      );
    default: {
      const unhandled: never = block;
      throw new Error(`Unhandled legacy content block: ${String(unhandled)}`);
    }
  }
}
