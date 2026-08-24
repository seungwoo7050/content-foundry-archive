import type { LoadedReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { createBuildConfigChecksum } from "./build-config-checksum";
import type { SiteReleaseContext } from "./load-site-release";
import { loadSiteRelease } from "./load-site-release";
import { resolveSiteBuildConfig } from "./site-build-config";
import { resolveSiteLaunchConfig } from "./site-launch-config";
import { REQUIRED_SITE_A_PAGE_PATHS } from "./site-launch-content-policy";
import { SITE_A_LAUNCH_CATEGORIES } from "./site-launch-discovery-policy";

function productionContext(): SiteReleaseContext {
  const template = loadSiteRelease(resolveSiteBuildConfig({}));
  const about = template.bundle.pages[0]!;
  const pages = REQUIRED_SITE_A_PAGE_PATHS.map((path, index) => ({
    ...about,
    id: `launch-page-${index}`,
    path,
    title: `Launch page ${index}`,
    seo: { ...about.seo, canonicalPath: path },
  }));
  const categories = SITE_A_LAUNCH_CATEGORIES.map((category) => ({
    ...category,
    description: `${category.label} 실용 안내`,
  }));
  const referenceArticle = template.bundle.articles[0]!;
  const bundle: LoadedReleaseBundle = {
    ...template.bundle,
    site: {
      ...template.bundle.site,
      origin: "https://guides.example.kr",
      defaultTheme: "friendly-mobile-utility",
      analytics: { provider: "ga4", publicMeasurementId: "G-SITEA123" },
      ads: {
        provider: "adsense",
        enabled: true,
        publicClientId: "ca-pub-1234567890123456",
      },
    },
    taxonomy: { ...template.bundle.taxonomy, categories },
    navigation: {
      items: [
        { id: "home", label: "홈", path: "/", children: [] },
        ...categories.map((category) => ({
          id: category.id,
          label: category.label,
          path: `/category/${category.slug}`,
          children: [],
        })),
        { id: "search", label: "검색", path: "/search", children: [] },
        { id: "about", label: "소개", path: "/about", children: [] },
      ],
    },
    pages,
    articles: categories.map((category, index) => ({
      ...referenceArticle,
      id: `ART-LAUNCH-${index}`,
      slug: `launch-${category.slug}`,
      title: `${category.label} launch article`,
      categoryId: category.id,
      seo: {
        ...referenceArticle.seo,
        canonicalPath: `/article/launch-${category.slug}`,
      },
      advertising: { enabled: true },
    })),
  };

  return {
    ...template,
    config: {
      ...template.config,
      mode: "production",
      origin: bundle.site.origin,
      noindex: false,
      analyticsEnabled: true,
      adsEnabled: true,
    },
    bundle,
    canonicalOrigin: bundle.site.origin,
  };
}

describe("Site A production launch configuration", () => {
  it("resolves one complete owned and approved provider configuration", () => {
    const context = productionContext();
    const launch = resolveSiteLaunchConfig(context, {
      CONSENT_PROVIDER: "google-cmp",
      CONSENT_CONFIG_REVISION: "cmp-r1",
      ADSENSE_MANUAL_UNITS: '{"article-end":"456","home-feed":"123"}',
      SITE_OWNED_GA4_MEASUREMENT_ID: "G-SITEA123",
      SITE_OWNED_ADSENSE_CLIENT_ID: "ca-pub-1234567890123456",
      GOOGLE_CMP_READY: "true",
      ADSENSE_AUTO_ADS_ENABLED: "false",
      ADSENSE_SITE_READY: "true",
    });

    expect(launch.analyticsOwnershipVerified).toBe(true);
    expect(launch.advertisingOwnershipVerified).toBe(true);
    expect(launch.adsTxtRecord).toBe(
      "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0",
    );
    expect(launch.advertising.provider).toBe("adsense");
    expect(createBuildConfigChecksum({ config: context.config, launch }))
      .toMatch(/^sha256:[0-9a-f]{64}$/);
  });
});
