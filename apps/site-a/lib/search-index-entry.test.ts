import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createSearchIndexEntry,
  type SearchIndexArticleRecord,
  type SearchIndexTaxonomy,
} from "./search-index-entry";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("search index entries", () => {
  it("accepts v3 records and projects resolved searchable fields", () => {
    expectTypeOf<LoadedReleaseBundleV3["articles"][number]>().toExtend<SearchIndexArticleRecord>();
    expectTypeOf<LoadedReleaseBundleV3["taxonomy"]>().toExtend<SearchIndexTaxonomy>();

    expect(
      createSearchIndexEntry(bundle.articles[0]!, 0, bundle.taxonomy, "ko-KR"),
    ).toMatchObject({
      id: "ART-000123",
      path: "/article/government24-resident-registration-guide",
      updatedAt: "2026-08-20T01:00:00Z",
      category: { id: "daily-admin", slug: "daily-admin", label: "생활·행정" },
      tags: [{ id: "government24", slug: "government24", label: "정부24" }],
      headings: [{ id: "prepare", text: "준비하기" }],
      keywords: expect.arrayContaining([
        "daily-admin",
        "government24",
        "생활·행정",
        "정부24",
        "준비하기",
      ]),
    });
  });

  it("fails closed with every unresolved taxonomy reference", () => {
    expect(() =>
      createSearchIndexEntry(
        { ...bundle.articles[0]!, categoryId: "missing", tagIds: ["unknown"] },
        3,
        bundle.taxonomy,
        "ko-KR",
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [
          expect.objectContaining({ path: "/articles/3/categoryId" }),
          expect.objectContaining({ path: "/articles/3/tagIds/0" }),
        ],
      }),
    );
  });
});
