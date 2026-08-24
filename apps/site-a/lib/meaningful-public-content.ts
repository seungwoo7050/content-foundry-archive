function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasTextItem(value: unknown): boolean {
  return Array.isArray(value) && value.some(hasText);
}

export function hasMeaningfulPublicContent(
  blocks: readonly unknown[],
): boolean {
  return blocks.some((block) => {
    if (!isRecord(block) || typeof block.type !== "string") return false;
    switch (block.type) {
      case "paragraph":
      case "quote":
      case "callout":
        return hasText(block.markdown);
      case "list":
        return hasTextItem(block.items);
      case "image":
        return hasText(block.mediaId);
      case "table":
        return hasText(block.caption)
          || hasTextItem(block.columns)
          || (Array.isArray(block.rows) && block.rows.some(hasTextItem));
      case "embed":
        return hasText(block.provider) && hasText(block.url);
      case "gallery":
        return Array.isArray(block.items) && block.items.some((item) => (
          isRecord(item) && hasText(item.mediaId)
        ));
      case "code":
        return hasText(block.code);
      case "command":
        return hasText(block.command);
      case "action-link":
        return hasText(block.label);
      case "niche-component":
        return hasText(block.fallbackText);
      default:
        return false;
    }
  });
}
