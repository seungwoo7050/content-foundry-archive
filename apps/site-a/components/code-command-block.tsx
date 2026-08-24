import type { PublishedCodeOrCommandBlockV3 } from "@content-foundry/content-contract";

interface CodeCommandBlockProps {
  readonly block: PublishedCodeOrCommandBlockV3;
}

export function CodeCommandBlock({ block }: CodeCommandBlockProps) {
  const isCode = block.type === "code";
  const kind = isCode ? "코드" : "명령";
  const format = isCode ? block.language : block.shell;
  const value = isCode ? block.code : block.command;
  const description = block.caption
    ? `${block.caption} — ${kind} (${format})`
    : `${kind} (${format})`;

  return (
    <figure className="content-code-command" data-block-type={block.type}>
      <figcaption>{description}</figcaption>
      <pre>
        <code>{value}</code>
      </pre>
    </figure>
  );
}
