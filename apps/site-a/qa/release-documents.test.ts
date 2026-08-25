import {
  validateContractDocument,
  validateV4PresentationReadiness,
  validateV4ReleaseBundle,
} from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { qaCorpus } from "./corpus";
import { qaMediaAssets } from "./media-assets";
import { projectQaReleaseDocuments } from "./release-documents";

const variant = {
  theme: "editorial-utility",
  skin: "warm-neutral",
  origin: "https://editorial-warm-neutral.qa.public-sites.example",
} as const;
const bundle = projectQaReleaseDocuments(variant);

describe("QA Contract 4 release document projection", () => {
  it("projects a complete schema-valid release without changing corpus records", () => {
    const corpusDocuments = [
      ["taxonomy", bundle.taxonomy],
      ["presentation", bundle.presentation],
      ["redirects", bundle.redirects],
    ] as const;
    corpusDocuments.forEach(([kind, document]) =>
      expect(validateContractDocument("4.0.0", kind, document)).toBe(document),
    );
    bundle.articles.forEach((article) =>
      expect(validateContractDocument("4.0.0", "article", article)).toBe(article),
    );
    bundle.pages.forEach((page) =>
      expect(validateContractDocument("4.0.0", "page", page)).toBe(page),
    );

    expect(validateV4ReleaseBundle(bundle)).toBe(bundle);
    expect(
      validateV4PresentationReadiness(bundle, {
        releaseMode: "qa",
        siteWideNoindex: qaCorpus.siteWideNoindex,
      }),
    ).toBe(bundle);
    expect(bundle.taxonomy).toBe(qaCorpus.taxonomy);
    expect(bundle.presentation).toBe(qaCorpus.presentation);
    expect(bundle.redirects).toBe(qaCorpus.redirects);
    expect(bundle.articles).toBe(qaCorpus.articles);
    expect(bundle.pages).toBe(qaCorpus.pages);
  });

  it("keeps the composed corpus non-operational and count-consistent", () => {
    expect([bundle.release.articleCount, bundle.release.pageCount]).toEqual([17, 4]);
    expect(
      [...bundle.articles, ...bundle.pages].every(({ seo }) => !seo.index),
    ).toBe(true);
    expect(bundle.presentation.brand).toEqual({
      logoMediaId: null,
      faviconMediaId: "MED-QA-005",
      socialImageMediaId: "MED-QA-001",
    });
    expect(bundle.navigation.items.map(({ path }) => path)).toEqual([
      "/",
      ...qaCorpus.taxonomy.categories.map(({ slug }) => `/category/${slug}`),
      "/archive",
      "/about",
      "/privacy",
      "/advertising-disclosure",
    ]);
    expect(bundle.mediaManifest.items).toEqual(
      qaMediaAssets.map(({ sourcePath, ...asset }) => ({
        ...asset,
        kind: "image",
        source: "bundle",
        path: `media/${sourcePath}`,
      })),
    );
  });
});
