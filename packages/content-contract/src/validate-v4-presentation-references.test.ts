import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { loadReleaseBundleForVersion } from "./load-release-bundle.js";
import { validateV4PresentationReferences } from "./validate-v4-presentation-references.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/4.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const loadFixture = () => loadReleaseBundleForVersion("4.0.0", fixture);

const expectReferenceIssue = (run: () => unknown, path: string) => {
  expect(run).toThrowError(
    expect.objectContaining({
      code: "REFERENCE_INVALID",
      issues: expect.arrayContaining([expect.objectContaining({ path })]),
    }),
  );
};

describe("v4 presentation references", () => {
  it("accepts resolved article/category selections and nullable brand slots", () => {
    expect(validateV4PresentationReferences(loadFixture())).toBeDefined();
  });

  it("rejects an unknown home article", () => {
    const bundle = loadFixture();
    bundle.presentation.home.featuredArticleIds = ["ART-MISSING"];
    expectReferenceIssue(
      () => validateV4PresentationReferences(bundle),
      "/presentation/home/featuredArticleIds/0",
    );
  });

  it("rejects an unknown highlight category", () => {
    const bundle = loadFixture();
    bundle.presentation.categoryHighlights[0]!.categoryId = "missing-category";
    expectReferenceIssue(
      () => validateV4PresentationReferences(bundle),
      "/presentation/categoryHighlights/0/categoryId",
    );
  });

  it("rejects an unknown highlight article", () => {
    const bundle = loadFixture();
    bundle.presentation.categoryHighlights[0]!.articleIds = ["ART-MISSING"];
    expectReferenceIssue(
      () => validateV4PresentationReferences(bundle),
      "/presentation/categoryHighlights/0/articleIds/0",
    );
  });

  it("requires a highlight article to belong to its selected category", () => {
    const bundle = loadFixture();
    bundle.taxonomy.categories.push({
      id: "digital",
      slug: "digital",
      label: "디지털",
      description: "디지털 서비스 안내",
    });
    bundle.presentation.categoryHighlights[0]!.categoryId = "digital";
    expectReferenceIssue(
      () => validateV4PresentationReferences(bundle),
      "/presentation/categoryHighlights/0/articleIds/0",
    );
  });

  it.each([
    ["logoMediaId", "MED-MISSING-LOGO"],
    ["faviconMediaId", "MED-MISSING-FAVICON"],
    ["socialImageMediaId", "MED-MISSING-SOCIAL"],
  ] as const)("rejects unresolved brand slot %s", (slot, mediaId) => {
    const bundle = loadFixture();
    bundle.presentation.brand[slot] = mediaId;
    expectReferenceIssue(
      () => validateV4PresentationReferences(bundle),
      `/presentation/brand/${slot}`,
    );
  });
});
