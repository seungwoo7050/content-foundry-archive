import { describe, expect, it } from "vitest";

import { createArchiveMetadata } from "./archive-metadata";

const context = {
  canonicalOrigin: "https://example.com",
  config: { noindex: true },
  bundle: { site: { name: "생활메모" } },
};

describe("archive metadata", () => {
  it("preserves the first-page canonical metadata", () => {
    expect(createArchiveMetadata(context)).toEqual({
      title: "전체 글",
      description: "생활메모에 게시된 안내 글을 최신순으로 모았습니다.",
      alternates: { canonical: "https://example.com/archive" },
      robots: { index: false, follow: false },
      openGraph: {
        type: "website",
        title: "전체 글",
        description: "생활메모에 게시된 안내 글을 최신순으로 모았습니다.",
        url: "https://example.com/archive",
        images: [],
      },
      twitter: {
        card: "summary",
        title: "전체 글",
        description: "생활메모에 게시된 안내 글을 최신순으로 모았습니다.",
        images: [],
      },
    });
  });

  it("uses a self-canonical page number in every social field", () => {
    expect(createArchiveMetadata(context, 2)).toMatchObject({
      title: "전체 글 2페이지",
      description: "생활메모에 게시된 안내 글을 최신순으로 모았습니다. 2페이지입니다.",
      alternates: { canonical: "https://example.com/archive/page/2" },
      openGraph: {
        title: "전체 글 2페이지",
        url: "https://example.com/archive/page/2",
      },
      twitter: { title: "전체 글 2페이지" },
    });
    expect(() => createArchiveMetadata(context, 0)).toThrow(RangeError);
  });
});
