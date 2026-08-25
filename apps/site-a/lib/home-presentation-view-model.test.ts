import { resolve } from "node:path";

import {
  loadSupportedReleaseBundle,
  type LoadedReleaseBundleV4,
} from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { createHomePresentationViewModel } from "./home-presentation-view-model";

const fixture = (version: "2.0.0" | "3.0.0" | "4.0.0") =>
  resolve(
    process.cwd(),
    `../../packages/content-contract/vendor/${version}/fixtures/bundles/valid/site-a-minimal`,
  );

const loadFixture = (version: "2.0.0" | "3.0.0" | "4.0.0") =>
  loadSupportedReleaseBundle(fixture(version), {
    resolveV3ConsumerContext: (bundle) => ({
      generatedRoutes: new Set([
        "/about",
        "/article/government24-resident-registration-guide",
      ]),
      nicheComponentRegistry: { [bundle.release.siteId]: [] },
    }),
    resolveV4ConsumerContext: (bundle) => ({
      generatedRoutes: new Set([
        "/about",
        "/article/government24-resident-registration-guide",
      ]),
      nicheComponentRegistry: { [bundle.release.siteId]: [] },
      presentationReadiness: {
        releaseMode: "template",
        siteWideNoindex: true,
      },
    }),
  });

const loadV4Fixture = (): LoadedReleaseBundleV4 => {
  const bundle = loadFixture("4.0.0");
  if (bundle.release.contractVersion !== "4.0.0") {
    throw new Error("Expected the exact Contract 4.0.0 fixture");
  }
  return bundle as LoadedReleaseBundleV4;
};

describe("home presentation view model", () => {
  it.each(["2.0.0", "3.0.0"] as const)(
    "keeps %s unclassified and derives only updated latest order",
    (version) => {
      const bundle = loadFixture(version);
      const model = createHomePresentationViewModel(bundle);

      expect(model.featuredArticles).toEqual([]);
      expect(model.currentArticles).toEqual([]);
      expect(model.evergreenArticles).toEqual([]);
      expect(model.categoryHighlights).toEqual([]);
      expect(model.latestArticles.map(({ id }) => id)).toEqual(["ART-000123"]);
    },
  );

  it("bounds unclassified fallback to the newest six articles", () => {
    const updatedAt = "2026-03-01T00:00:00Z";
    const articles = ["H", "G", "F", "E", "D", "C", "B", "A"].map(
      (suffix) => ({ id: `ART-${suffix}`, updatedAt }),
    );

    const model = createHomePresentationViewModel({ articles });

    expect(model.latestArticles.map(({ id }) => id)).toEqual([
      "ART-A",
      "ART-B",
      "ART-C",
      "ART-D",
      "ART-E",
      "ART-F",
    ]);
  });

  it("projects explicit v4 groups and excludes every placement from latest", () => {
    const bundle = loadV4Fixture();
    const source = bundle.articles[0]!;
    const article = (id: string, updatedAt: string) => ({
      ...source,
      id,
      updatedAt,
    });
    const latestArticles = Array.from({ length: 7 }, (_, index) =>
      article(
        `ART-LATEST-${index + 1}`,
        `2026-03-${String(index + 4).padStart(2, "0")}T00:00:00Z`,
      ),
    );
    const articles = [
      source,
      article("ART-CURRENT", "2026-03-02T00:00:00Z"),
      article("ART-EVERGREEN", "2026-03-03T00:00:00Z"),
      ...latestArticles,
    ];
    const presentation = {
      ...bundle.presentation,
      home: {
        featuredArticleIds: ["ART-000123"] as [string],
        currentArticleIds: ["ART-CURRENT"] as [string],
        evergreenArticleIds: ["ART-EVERGREEN"] as [string],
      },
    };

    const model = createHomePresentationViewModel({
      ...bundle,
      articles,
      presentation,
    });

    expect(model.featuredArticles.map(({ id }) => id)).toEqual(["ART-000123"]);
    expect(model.currentArticles.map(({ id }) => id)).toEqual(["ART-CURRENT"]);
    expect(model.evergreenArticles.map(({ id }) => id)).toEqual([
      "ART-EVERGREEN",
    ]);
    expect(model.latestArticles.map(({ id }) => id)).toEqual([
      "ART-LATEST-7",
      "ART-LATEST-6",
      "ART-LATEST-5",
      "ART-LATEST-4",
      "ART-LATEST-3",
      "ART-LATEST-2",
    ]);
    expect(model.categoryHighlights[0]).toMatchObject({
      categoryId: "daily-admin",
      articles: [{ id: "ART-000123" }],
    });
  });

  it("never replaces a missing validated v4 placement with latest content", () => {
    const bundle = loadV4Fixture();
    expect(() =>
      createHomePresentationViewModel({
        ...bundle,
        presentation: {
          ...bundle.presentation,
          home: {
            ...bundle.presentation.home,
            featuredArticleIds: ["ART-MISSING"],
          },
        },
      }),
    ).toThrow("Validated presentation article is missing: ART-MISSING");
  });
});
