import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
  type LoadedReleaseBundleV4,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import { projectQaReleaseDocuments } from "../qa/release-documents";

import {
  createSearchIndexArtifact,
  type SearchIndexArtifactSource,
} from "./search-index-artifact";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const qaBundle = projectQaReleaseDocuments({
  theme: "friendly-mobile-utility",
  skin: "calm-blue",
  origin: "https://friendly-mobile-utility-calm-blue.qa.public-sites.example",
});

describe("search index artifact", () => {
  it("accepts supported release structures and binds entries to release identity", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<SearchIndexArtifactSource>();
    expectTypeOf<LoadedReleaseBundleV4>().toExtend<SearchIndexArtifactSource>();
    const artifact = createSearchIndexArtifact(bundle);

    expect(artifact).toMatchObject({
      schemaVersion: "1.0.0",
      release: {
        releaseId: "REL-2026-000042",
        siteId: "site-a",
        contractVersion: "2.0.0",
        bundleChecksum:
          "sha256:0a8f03190b0a5d63fefc52e3efab08080a08263a6c8d716f0e4936382eee6f27",
      },
      locale: "ko-KR",
    });
    expect(artifact.entries).toHaveLength(1);
    expect(artifact.entries[0]?.id).toBe("ART-000123");
  });

  it("can include all 17 noindex QA articles without changing the default", () => {
    expect(createSearchIndexArtifact(qaBundle).entries).toEqual([]);

    const artifact = createSearchIndexArtifact(qaBundle, {
      includeNonIndexable: true,
    });

    expect(artifact.entries).toHaveLength(17);
    expect(artifact.entries.map(({ path }) => path)).toEqual(
      qaBundle.articles.map(({ seo }) => seo.canonicalPath).sort(),
    );
  });

  it("excludes non-indexable articles and sorts canonical paths", () => {
    const reference = bundle.articles[0]!;
    const artifact = createSearchIndexArtifact({
      ...bundle,
      articles: [
        {
          ...reference,
          id: "ART-Z",
          seo: { ...reference.seo, canonicalPath: "/article/z" },
        },
        {
          ...reference,
          id: "ART-HIDDEN",
          seo: { ...reference.seo, canonicalPath: "/article/hidden", index: false },
        },
        {
          ...reference,
          id: "ART-A",
          seo: { ...reference.seo, canonicalPath: "/article/a" },
        },
      ],
    });

    expect(artifact.entries.map(({ path }) => path)).toEqual([
      "/article/a",
      "/article/z",
    ]);
  });
});
