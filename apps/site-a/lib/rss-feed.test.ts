import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import { createRssFeed, type RssFeedSource } from "./rss-feed";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("RSS feed projection", () => {
  it("accepts v3 releases and projects the canonical fixture article", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<RssFeedSource>();
    const feed = createRssFeed("https://example.com", bundle);

    expect(feed).toContain('<rss version="2.0">');
    expect(feed).toContain("<title>생활메모</title>");
    expect(feed).toContain(
      "<link>https://example.com/article/government24-resident-registration-guide</link>",
    );
    expect(feed).toContain("<pubDate>Thu, 20 Aug 2026 01:00:00 GMT</pubDate>");
    expect(feed).toContain("<category>생활·행정</category>");
  });

  it("orders newest indexable articles and emits only safe XML", () => {
    const reference = bundle.articles[0]!;
    const feed = createRssFeed("https://example.com", {
      ...bundle,
      site: { ...bundle.site, name: "Life & <Notes>" },
      taxonomy: {
        ...bundle.taxonomy,
        categories: [{ ...bundle.taxonomy.categories[0]!, label: "A\u0000&B" }],
      },
      articles: [
        {
          ...reference,
          id: "ART-OLD",
          title: "Old",
          publishedAt: "2026-08-20T00:00:00Z",
          seo: { ...reference.seo, canonicalPath: "/article/old" },
        },
        {
          ...reference,
          id: "ART-HIDDEN",
          title: "Hidden",
          seo: { ...reference.seo, index: false },
        },
        {
          ...reference,
          id: "ART-NEW",
          title: "New <Guide>",
          publishedAt: "2026-08-21T00:00:00Z",
          seo: { ...reference.seo, canonicalPath: "/article/new" },
        },
      ],
    });

    expect(feed.indexOf("New &lt;Guide&gt;")).toBeLessThan(
      feed.indexOf("Old"),
    );
    expect(feed).toContain("<title>Life &amp; &lt;Notes&gt;</title>");
    expect(feed).toContain("<category>A&amp;B</category>");
    expect(feed).not.toContain("Hidden");
    expect(feed).not.toContain("\u0000");
  });

  it("fails closed when an article category is missing", () => {
    expect(() =>
      createRssFeed("https://example.com", {
        ...bundle,
        articles: [{ ...bundle.articles[0]!, categoryId: "missing" }],
      }),
    ).toThrowError(expect.objectContaining({ code: "REFERENCE_INVALID" }));
  });
});
