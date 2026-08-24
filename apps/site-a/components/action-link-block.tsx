import type { PublishedActionLinkBlockV3 } from "@content-foundry/content-contract";

interface ActionLinkBlockProps {
  readonly block: PublishedActionLinkBlockV3;
}

const internalPathPattern =
  /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/;

function assertCanonicalInternalPath(path: string) {
  if (!internalPathPattern.test(path)) {
    throw new Error("Unsafe internal action path");
  }
}

function assertSafeExternalUrl(value: string) {
  const url = URL.parse(value);
  if (
    !value.startsWith("https://") ||
    url === null ||
    url.hostname.length === 0 ||
    url.username.length > 0 ||
    url.password.length > 0
  ) {
    throw new Error("Unsafe external action URL");
  }
}

export function ActionLinkBlock({ block }: ActionLinkBlockProps) {
  if (block.kind === "internal") {
    assertCanonicalInternalPath(block.path);
    return (
      <p className="content-action-link" data-action-kind={block.kind}>
        <a href={block.path}>{block.label}</a>
      </p>
    );
  }

  assertSafeExternalUrl(block.url);
  const disclosure =
    block.kind === "affiliate" ? "제휴 링크 · 새 창" : "공식 사이트 · 새 창";
  const rel =
    block.kind === "affiliate"
      ? "sponsored noreferrer noopener"
      : "noreferrer noopener";

  return (
    <p className="content-action-link" data-action-kind={block.kind}>
      <a href={block.url} rel={rel} target="_blank">
        {block.label} <span>({disclosure})</span>
      </a>
    </p>
  );
}
