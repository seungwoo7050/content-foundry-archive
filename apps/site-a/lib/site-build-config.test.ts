import { describe, expect, it } from "vitest";

import { resolveSiteBuildConfig } from "./site-build-config.js";

const productionEnvironment = {
  RELEASE_MODE: "production",
  CONTENT_RELEASE_DIR: "/releases/production",
  SITE_ORIGIN: "https://site-a.example",
  SITE_ALLOWED_PRODUCTION_ORIGINS: '["https://site-a.example"]',
  ENABLE_ANALYTICS: "true",
  ENABLE_ADS: "true",
} as const;

describe("resolveSiteBuildConfig", () => {
  it("preserves the template defaults without an origin allowlist", () => {
    expect(resolveSiteBuildConfig({})).toMatchObject({
      siteId: "site-a",
      mode: "template",
      origin: null,
      noindex: true,
      analyticsEnabled: false,
      adsEnabled: false,
    });
  });

  it("does not apply the production allowlist to preview origins", () => {
    expect(
      resolveSiteBuildConfig({
        RELEASE_MODE: "preview",
        CONTENT_RELEASE_DIR: "/releases/preview",
        SITE_ORIGIN: "https://preview.site-a.example",
        SITE_ALLOWED_PRODUCTION_ORIGINS: '["https://site-a.example"]',
        ENABLE_ANALYTICS: "true",
        ENABLE_ADS: "true",
      }),
    ).toEqual({
      siteId: "site-a",
      mode: "preview",
      releaseDirectory: "/releases/preview",
      origin: "https://preview.site-a.example",
      noindex: true,
      analyticsEnabled: false,
      adsEnabled: false,
    });
  });

  it("allows production only when SITE_ORIGIN is in the parsed allowlist", () => {
    expect(resolveSiteBuildConfig(productionEnvironment)).toEqual({
      siteId: "site-a",
      mode: "production",
      releaseDirectory: "/releases/production",
      origin: "https://site-a.example",
      noindex: false,
      analyticsEnabled: true,
      adsEnabled: true,
    });
  });

  it.each([
    ["missing", undefined],
    ["blank", ""],
    ["empty", "[]"],
    ["unlisted", '["https://other.example"]'],
  ])("fails closed for a %s production allowlist", (_label, allowlist) => {
    expect(() =>
      resolveSiteBuildConfig({
        ...productionEnvironment,
        SITE_ALLOWED_PRODUCTION_ORIGINS: allowlist,
      }),
    ).toThrow("SITE_ORIGIN is not allowed for site-a");
  });

  it("fails closed when the production allowlist is malformed", () => {
    expect(() =>
      resolveSiteBuildConfig({
        ...productionEnvironment,
        SITE_ALLOWED_PRODUCTION_ORIGINS: "not-json",
      }),
    ).toThrow("SITE_ALLOWED_PRODUCTION_ORIGINS must be valid JSON");
  });
});
