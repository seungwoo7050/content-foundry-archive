import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import { createSitemapEntries, type SitemapSource } from "./sitemap";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("sitemap projection", () => {
  it("accepts v3 releases and projects the canonical fixture inventory", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<SitemapSource>();
    expect(createSitemapEntries("https://example.com", bundle)).toEqual([
      { url: "https://example.com/" },
      { url: "https://example.com/archive" },
      {
        url: "https://example.com/article/government24-resident-registration-guide",
        lastModified: "2026-08-20T01:00:00Z",
      },
      { url: "https://example.com/category/daily-admin" },
      { url: "https://example.com/about" },
    ]);
  });

  it("filters non-indexable documents and orders each release group", () => {
    const article = structuredClone(bundle.articles[0]!);
    const page = structuredClone(bundle.pages[0]!);
    const entries = createSitemapEntries("https://example.com", {
      articles: [
        {
          ...article,
          categoryId: "z-category",
          seo: { ...article.seo, canonicalPath: "/article/z" },
        },
        {
          ...article,
          categoryId: "z-category",
          seo: { ...article.seo, canonicalPath: "/article/hidden", index: false },
        },
        {
          ...article,
          categoryId: "a-category",
          seo: { ...article.seo, canonicalPath: "/article/a" },
        },
      ],
      taxonomy: {
        categories: [
          { id: "z-category", label: "Z", slug: "z-category" },
          { id: "a-category", label: "A", slug: "a-category" },
        ],
      },
      pages: [
        {
          ...page,
          path: "/z-page",
          seo: { ...page.seo, canonicalPath: "/z-page" },
        },
        {
          ...page,
          path: "/hidden",
          seo: { ...page.seo, canonicalPath: "/hidden", index: false },
        },
        {
          ...page,
          path: "/a-page",
          seo: { ...page.seo, canonicalPath: "/a-page" },
        },
      ],
    });

    expect(entries.map(({ url }) => new URL(url).pathname)).toEqual([
      "/",
      "/archive",
      "/article/a",
      "/article/z",
      "/category/a-category",
      "/category/z-category",
      "/a-page",
      "/z-page",
    ]);
    expect(entries.filter((entry) => "lastModified" in entry)).toHaveLength(2);
  });

  it("includes every generated archive and category pagination page", () => {
    const article = bundle.articles[0];
    if (!article) throw new Error("Site A fixture article is missing");
    const entries = createSitemapEntries("https://example.com", {
      ...bundle,
      articles: Array.from({ length: 13 }, (_, index) => ({
        ...article,
        id: `ART-${String(index + 1).padStart(6, "0")}`,
        seo: { ...article.seo, canonicalPath: `/article/guide-${index + 1}` },
      })),
    });

    expect(entries
      .map(({ url }) => new URL(url).pathname)
      .filter((path) => path.includes("/page/")))
      .toEqual([
        "/archive/page/2",
        "/category/daily-admin/page/2",
      ]);
  });
});
