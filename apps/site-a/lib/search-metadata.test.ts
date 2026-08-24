import { describe, expect, it } from "vitest";

import { createSearchMetadata } from "./search-metadata";

describe("search route metadata", () => {
  it("keeps production search canonical but never indexable", () => {
    expect(
      createSearchMetadata({
        canonicalOrigin: "https://example.com",
        config: { noindex: false },
      }),
    ).toMatchObject({
      title: "검색",
      description: "사이트에 게시된 안내를 기기 안에서 검색합니다.",
      alternates: { canonical: "https://example.com/search" },
      robots: { index: false, follow: true },
      openGraph: {
        type: "website",
        url: "https://example.com/search",
        images: [],
      },
      twitter: { card: "summary", images: [] },
    });
  });

  it("also suppresses following in template and preview modes", () => {
    expect(
      createSearchMetadata({
        canonicalOrigin: "https://preview.example.com",
        config: { noindex: true },
      }).robots,
    ).toEqual({ index: false, follow: false });
  });
});
