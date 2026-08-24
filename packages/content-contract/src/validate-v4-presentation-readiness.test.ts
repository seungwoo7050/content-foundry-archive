import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { loadReleaseBundleForVersion } from "./load-release-bundle.js";
import { validateV4PresentationReadiness } from "./validate-v4-presentation-readiness.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/4.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const loadFixture = () => loadReleaseBundleForVersion("4.0.0", fixture);

function productionReadyFixture() {
  const bundle = loadFixture();
  const source = bundle.articles[0]!;
  const evergreen = {
    ...source,
    id: "ART-EVERGREEN",
    slug: "evergreen-guide",
    seo: { ...source.seo, canonicalPath: "/article/evergreen-guide" },
  };
  bundle.presentation.home.evergreenArticleIds = ["ART-EVERGREEN"];
  bundle.presentation.brand.faviconMediaId = "MED-000045";
  bundle.presentation.brand.socialImageMediaId = "MED-000046";
  return { ...bundle, articles: [...bundle.articles, evergreen] };
}

describe("v4 presentation release-mode readiness", () => {
  it.each(["qa", "template", "preview"] as const)(
    "accepts empty-capable, noindex %s input",
    (releaseMode) => {
      expect(() =>
        validateV4PresentationReadiness(loadFixture(), {
          releaseMode,
          siteWideNoindex: true,
        }),
      ).not.toThrow();
    },
  );

  it("requires site-wide noindex outside production", () => {
    expect(() =>
      validateV4PresentationReadiness(loadFixture(), {
        releaseMode: "qa",
        siteWideNoindex: false,
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "CONTRACT_INVALID",
        issues: [
          expect.objectContaining({
            path: "/validationContext/siteWideNoindex",
          }),
        ],
      }),
    );
  });

  it.each(["articles", "pages"] as const)(
    "rejects an indexable non-production %s record",
    (group) => {
      const bundle = loadFixture();
      bundle[group][0]!.seo.index = true;
      expect(() =>
        validateV4PresentationReadiness(bundle, {
          releaseMode: "template",
          siteWideNoindex: true,
        }),
      ).toThrowError(
        expect.objectContaining({
          code: "CONTRACT_INVALID",
          issues: [expect.objectContaining({ path: `/${group}/0/seo/index` })],
        }),
      );
    },
  );

  it("reports every missing production presentation requirement", () => {
    expect(() =>
      validateV4PresentationReadiness(loadFixture(), {
        releaseMode: "production",
        siteWideNoindex: false,
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "CONTRACT_INVALID",
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: "/presentation/home/evergreenArticleIds",
          }),
          expect.objectContaining({
            path: "/presentation/brand/faviconMediaId",
          }),
          expect.objectContaining({
            path: "/presentation/brand/socialImageMediaId",
          }),
        ]),
      }),
    );
  });

  it("accepts the complete production presentation minimum", () => {
    expect(() =>
      validateV4PresentationReadiness(productionReadyFixture(), {
        releaseMode: "production",
        siteWideNoindex: false,
      }),
    ).not.toThrow();
  });

  it("requires a non-empty highlight for every production category", () => {
    const bundle = productionReadyFixture();
    bundle.taxonomy.categories.push({
      id: "digital",
      slug: "digital",
      label: "디지털",
      description: "디지털 서비스 안내",
    });
    expect(() =>
      validateV4PresentationReadiness(bundle, {
        releaseMode: "production",
        siteWideNoindex: false,
      }),
    ).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({
            path: "/presentation/categoryHighlights",
          }),
        ],
      }),
    );
  });
});
