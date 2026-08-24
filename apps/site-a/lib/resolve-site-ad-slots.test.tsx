import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { resolveSiteAdSlots } from "./resolve-site-ad-slots";

const enabledSource = {
  config: {
    mode: "production",
    adsEnabled: true,
    analyticsEnabled: false,
  },
  bundle: {
    site: {
      ads: {
        provider: "adsense",
        enabled: true,
        publicClientId: "ca-pub-1234567890123456",
      },
      analytics: { provider: "disabled", publicMeasurementId: null },
      defaultTheme: "friendly-mobile-utility",
    },
  },
} as const;

describe("Site A manual ad slot resolution", () => {
  it("keeps a disabled build empty even when unit input is unusable", () => {
    expect(resolveSiteAdSlots({
      config: {
        mode: "template",
        adsEnabled: false,
        analyticsEnabled: false,
      },
      bundle: {
        site: {
          ...enabledSource.bundle.site,
          defaultTheme: "minimal-knowledge-base",
        },
      },
    }, {
      CONSENT_PROVIDER: "disabled",
      ADSENSE_MANUAL_UNITS: "not-json",
    })).toEqual({});
  });

  it("binds the exact environment input to consent-approved slots", () => {
    const slots = resolveSiteAdSlots(enabledSource, {
      CONSENT_PROVIDER: "google-cmp",
      CONSENT_CONFIG_REVISION: "cmp-revision-1",
      ADSENSE_MANUAL_UNITS: '{"home-feed":"123","article-end":"456"}',
    });
    const html = renderToStaticMarkup(
      <>{slots["home-feed"]}{slots["article-end"]}</>,
    );

    expect(Object.keys(slots)).toEqual(["home-feed", "article-end"]);
    expect(html).toContain('data-ad-placement="home-feed"');
    expect(html).toContain('data-ad-placement="article-end"');
  });

  it("fails closed when an enabled build omits the fixed input", () => {
    expect(() => resolveSiteAdSlots(enabledSource, {
      CONSENT_PROVIDER: "google-cmp",
      CONSENT_CONFIG_REVISION: "cmp-revision-1",
    })).toThrow("ADSENSE_MANUAL_UNITS is required");
  });
});
