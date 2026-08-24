import {
  type LoadedReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  getEstimatedReadingTimeMinutes,
  type ArticleReadingTimeSource,
} from "./article-reading-time";

const words = (count: number) =>
  Array.from({ length: count }, (_, index) => `word${index}`).join(" ");

describe("estimated article reading time", () => {
  it("accepts v2 and v3 published article projections", () => {
    expectTypeOf<
      LoadedReleaseBundle["articles"][number]
    >().toExtend<ArticleReadingTimeSource>();
    expectTypeOf<
      LoadedReleaseBundleV3["articles"][number]
    >().toExtend<ArticleReadingTimeSource>();
  });

  it("uses 200 word-like segments per minute and rounds upward", () => {
    expect(
      getEstimatedReadingTimeMinutes(
        { content: [{ type: "paragraph", markdown: words(200) }], faq: [] },
        "en",
      ),
    ).toBe(1);
    expect(
      getEstimatedReadingTimeMinutes(
        { content: [{ type: "paragraph", markdown: words(201) }], faq: [] },
        "en",
      ),
    ).toBe(2);
  });

  it("counts visible code, command, and FAQ text", () => {
    expect(
      getEstimatedReadingTimeMinutes(
        {
          content: [
            { type: "paragraph", markdown: words(197) },
            { type: "code", language: "text", code: "codeword" },
            { type: "command", shell: "sh", command: "commandword" },
          ],
          faq: [{ question: "questionword", answerMarkdown: "answerword" }],
        },
        "en",
      ),
    ).toBe(2);
  });

  it("keeps an empty visible article at the one-minute minimum", () => {
    expect(
      getEstimatedReadingTimeMinutes(
        {
          content: [{ type: "image", mediaId: "MED-hidden-words" }],
          faq: [],
        },
        "ko-KR",
      ),
    ).toBe(1);
  });
});
