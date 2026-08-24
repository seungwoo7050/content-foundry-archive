import type { PublishedContentBlockV3 } from "@content-foundry/content-contract";

const WORDS_PER_MINUTE = 200;

export interface ArticleReadingTimeSource {
  readonly content: readonly PublishedContentBlockV3[];
  readonly faq: readonly {
    readonly question: string;
    readonly answerMarkdown: string;
  }[];
}

function present(value: string | null | undefined): string[] {
  return value ? [value] : [];
}

function getVisibleBlockText(block: PublishedContentBlockV3): string[] {
  switch (block.type) {
    case "heading":
      return [block.text];
    case "paragraph":
    case "quote":
    case "callout":
      return [block.markdown, ...present("attribution" in block ? block.attribution : null)];
    case "list":
      return [...block.items];
    case "image":
      return present(block.caption);
    case "table":
      return [
        ...present(block.caption),
        ...block.columns,
        ...block.rows.flat(),
      ];
    case "embed":
      return [block.provider];
    case "gallery":
      return [
        ...present(block.caption),
        ...block.items.flatMap(({ caption }) => present(caption)),
      ];
    case "code":
      return [...present(block.caption), block.code];
    case "command":
      return [...present(block.caption), block.command];
    case "action-link":
      return [block.label];
    case "niche-component":
      return [block.label, block.fallbackText];
    default: {
      const unhandled: never = block;
      throw new Error(`Unsupported reading-time block: ${String(unhandled)}`);
    }
  }
}

export function getEstimatedReadingTimeMinutes(
  article: ArticleReadingTimeSource,
  locale: string,
): number {
  const visibleText = [
    ...article.content.flatMap(getVisibleBlockText),
    ...article.faq.flatMap(({ question, answerMarkdown }) => [
      question,
      answerMarkdown,
    ]),
  ].join("\n");
  const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
  let wordUnits = 0;
  for (const segment of segmenter.segment(visibleText)) {
    if (segment.isWordLike) wordUnits += 1;
  }
  return Math.max(1, Math.ceil(wordUnits / WORDS_PER_MINUTE));
}
