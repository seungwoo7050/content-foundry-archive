import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { loadReleaseBundleForVersion } from "./load-release-bundle.js";
import { validateV4PresentationStructure } from "./validate-v4-presentation-structure.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/4.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);

const loadFixture = () => loadReleaseBundleForVersion("4.0.0", fixture);

describe("v4 presentation structure", () => {
  it("accepts distinct home groups and category selections", () => {
    expect(validateV4PresentationStructure(loadFixture())).toBeDefined();
  });

  it("rejects an article selected in two home groups", () => {
    const bundle = loadFixture();
    bundle.presentation.home.currentArticleIds = ["ART-000123"];

    expect(() => validateV4PresentationStructure(bundle)).toThrowError(
      expect.objectContaining({
        code: "CONTRACT_INVALID",
        issues: [
          expect.objectContaining({
            path: "/presentation/home/currentArticleIds/0",
          }),
        ],
      }),
    );
  });

  it("rejects duplicate category highlight records", () => {
    const bundle = loadFixture();
    bundle.presentation.categoryHighlights.push({
      categoryId: "daily-admin",
      articleIds: [],
    });

    expect(() => validateV4PresentationStructure(bundle)).toThrowError(
      expect.objectContaining({
        code: "CONTRACT_INVALID",
        issues: [
          expect.objectContaining({
            path: "/presentation/categoryHighlights/1/categoryId",
          }),
        ],
      }),
    );
  });
});
