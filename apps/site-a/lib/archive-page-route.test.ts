import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import {
  getArchiveAdditionalPageStaticParams,
  resolveArchiveAdditionalPage,
} from "./archive-page-route";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const article = bundle.articles[0]!;

function createArticles(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    ...article,
    id: `ART-${String(index + 1).padStart(6, "0")}`,
    seo: {
      ...article.seo,
      canonicalPath: `/article/guide-${index + 1}`,
    },
  }));
}

describe("archive additional page route", () => {
  it("generates only page-two-and-later parameters", () => {
    expect(getArchiveAdditionalPageStaticParams(bundle)).toEqual([]);
    expect(
      getArchiveAdditionalPageStaticParams({
        ...bundle,
        articles: createArticles(25),
      }),
    ).toEqual([{ page: "2" }, { page: "3" }]);
  });

  it("resolves only canonical in-range parameters", () => {
    const source = { ...bundle, articles: createArticles(13) };

    expect(resolveArchiveAdditionalPage(source, "2")).toBe(2);
    expect(resolveArchiveAdditionalPage(source, "1")).toBeNull();
    expect(resolveArchiveAdditionalPage(source, "02")).toBeNull();
    expect(resolveArchiveAdditionalPage(source, "3")).toBeNull();
  });

  it("preserves fail-closed archive taxonomy validation", () => {
    expect(() => getArchiveAdditionalPageStaticParams({
      ...bundle,
      articles: [{ ...article, categoryId: "missing-category" }],
    })).toThrowError(expect.objectContaining({ code: "REFERENCE_INVALID" }));
  });
});
