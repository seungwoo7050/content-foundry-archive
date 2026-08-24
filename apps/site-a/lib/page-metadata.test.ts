import { resolve } from "node:path";

import type { LoadedReleaseBundleV3 } from "@content-foundry/content-contract";
import { resolveBuildTargetConfig } from "@content-foundry/site-core";
import { describe, expect, expectTypeOf, it } from "vitest";

import { loadSiteRelease, type SiteReleaseContextV3 } from "./load-site-release";
import type { MetadataContext } from "./metadata-context";
import { createPageMetadata, type PageMetadataSource } from "./page-metadata";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const context = loadSiteRelease(
  resolveBuildTargetConfig({}, {
    siteId: "site-a",
    templateReleaseDirectory: fixture,
    allowedProductionOrigins: [],
  }),
);

describe("createPageMetadata", () => {
  it("accepts v3 page and release context metadata structures", () => {
    expectTypeOf<SiteReleaseContextV3>().toExtend<MetadataContext>();
    expectTypeOf<
      LoadedReleaseBundleV3["pages"][number]
    >().toExtend<PageMetadataSource>();
  });

  it("projects static-page SEO while preserving template noindex", () => {
    const page = context.bundle.pages[0];
    if (!page) {
      throw new Error("Site A fixture page is missing");
    }

    const metadata = createPageMetadata(context, page);

    expect(metadata.title).toBe("생활메모 소개");
    expect(metadata.description).toBe("생활메모 운영 목적과 정보 준비 방법");
    expect(metadata.alternates).toEqual({
      canonical: "https://example.com/about",
    });
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "https://example.com/about",
      images: [],
    });
    expect(metadata.twitter).toMatchObject({ card: "summary", images: [] });
  });
});
