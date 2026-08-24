import type { LoadedReleaseBundleV3 } from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  isArticleAdvertisingEligible,
  type ArticleAdEligibilityContext,
  type ArticleAdEligibilityRecord,
} from "./article-ad-eligibility";
import type { SiteReleaseContextV3 } from "./load-site-release";

const eligibleContext: ArticleAdEligibilityContext = {
  config: { adsEnabled: true },
  site: { ads: { provider: "adsense", enabled: true } },
};
const eligibleArticle: ArticleAdEligibilityRecord = {
  advertising: { enabled: true },
};

describe("article advertising eligibility", () => {
  it("accepts supported release and article structures", () => {
    expectTypeOf<SiteReleaseContextV3["config"]>().toExtend<
      ArticleAdEligibilityContext["config"]
    >();
    expectTypeOf<LoadedReleaseBundleV3["site"]>().toExtend<
      ArticleAdEligibilityContext["site"]
    >();
    expectTypeOf<
      LoadedReleaseBundleV3["articles"][number]
    >().toExtend<ArticleAdEligibilityRecord>();
  });

  it("allows only a build, site, provider, and article that all opt in", () => {
    expect(isArticleAdvertisingEligible(eligibleContext, eligibleArticle)).toBe(
      true,
    );
  });

  it.each([
    [{ ...eligibleContext, config: { adsEnabled: false } }, eligibleArticle],
    [
      { ...eligibleContext, site: { ads: { provider: "adsense", enabled: false } } },
      eligibleArticle,
    ],
    [
      { ...eligibleContext, site: { ads: { provider: "disabled", enabled: true } } },
      eligibleArticle,
    ],
    [eligibleContext, { advertising: { enabled: false } }],
  ] as const)("fails closed when one policy layer is disabled", (context, article) => {
    expect(isArticleAdvertisingEligible(context, article)).toBe(false);
  });
});
