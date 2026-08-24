import { AdvertisingConfigError } from "@content-foundry/advertising";
import { describe, expect, it } from "vitest";

import { resolveSiteAdvertisingConfig } from "./site-advertising-config";

const consent = {
  provider: "google-cmp",
  configRevision: "sha256:consent-a",
} as const;
const enabledSource = {
  config: { adsEnabled: true },
  bundle: {
    site: {
      ads: {
        provider: "adsense",
        enabled: true,
        publicClientId: "ca-pub-1234567890123456",
      },
      defaultTheme: "friendly-mobile-utility",
    },
  },
} as const;

describe("Site A advertising release binding", () => {
  it("keeps disabled builds identity-free and ignores provider inputs", () => {
    expect(resolveSiteAdvertisingConfig({
      config: { adsEnabled: false },
      bundle: {
        site: {
          ads: {
            provider: "disabled",
            enabled: false,
            publicClientId: null,
          },
          defaultTheme: "minimal-knowledge-base",
        },
      },
    }, { provider: "disabled", configRevision: null }, "not-json")).toEqual({
      provider: "disabled",
      enabled: false,
      publicClientId: null,
      manualUnits: {},
    });
  });

  it("enables only manual units supported by the release theme", () => {
    expect(resolveSiteAdvertisingConfig(
      enabledSource,
      consent,
      '{"home-feed":"123","article-end":"456"}',
    )).toEqual({
      provider: "adsense",
      enabled: true,
      publicClientId: "ca-pub-1234567890123456",
      manualUnits: { "home-feed": "123", "article-end": "456" },
    });
  });

  it("requires Google CMP for an enabled release", () => {
    expect(() => resolveSiteAdvertisingConfig(
      enabledSource,
      { provider: "disabled", configRevision: null },
      '{"article-end":"456"}',
    )).toThrow(AdvertisingConfigError);
  });

  it.each([
    ["friendly-mobile-utility", "desktop-sidebar"],
    ["minimal-knowledge-base", "article-end"],
  ] as const)("rejects unsupported %s slot %s", (defaultTheme, slotId) => {
    expect(() => resolveSiteAdvertisingConfig({
      ...enabledSource,
      bundle: {
        site: { ...enabledSource.bundle.site, defaultTheme },
      },
    }, consent, JSON.stringify({ [slotId]: "456" }))).toThrow(
      `theme ${defaultTheme} does not support ad slot ${slotId}`,
    );
  });
});
