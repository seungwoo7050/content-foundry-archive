import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createWebsiteStructuredData,
  type WebsiteStructuredDataContext,
} from "./website-structured-data";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("website structured data", () => {
  it("accepts v3 site identity and projects only visible publisher facts", () => {
    expectTypeOf<LoadedReleaseBundleV3["site"]>().toExtend<
      WebsiteStructuredDataContext["site"]
    >();

    const data = createWebsiteStructuredData({
      canonicalOrigin: bundle.site.origin,
      site: bundle.site,
    });

    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "생활메모",
      url: "https://example.com/",
      description: "실생활에 도움이 되는 정보를 정리하는 1인 운영 블로그",
      inLanguage: "ko-KR",
      publisher: { "@type": "Person", name: "생활메모" },
    });
    expect(data).not.toHaveProperty("potentialAction");
    expect(data).not.toHaveProperty("sameAs");
  });

  it("publishes a distinct release-backed short name when present", () => {
    const data = createWebsiteStructuredData({
      canonicalOrigin: bundle.site.origin,
      site: { ...bundle.site, shortName: "생활 안내" },
    });

    expect(data.alternateName).toBe("생활 안내");
  });
});
