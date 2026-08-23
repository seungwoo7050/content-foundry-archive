import { describe, expect, it } from "vitest";

import { resolveBuildTargetConfig } from "./release-mode.js";

const options = {
  siteId: "site-a",
  templateReleaseDirectory: "/fixtures/site-a",
  allowedProductionOrigins: ["https://site-a.example.org"],
} as const;

describe("resolveBuildTargetConfig", () => {
  it("defaults to a noindex template with the local fixture", () => {
    expect(resolveBuildTargetConfig({}, options)).toEqual({
      siteId: "site-a",
      mode: "template",
      releaseDirectory: "/fixtures/site-a",
      origin: null,
      noindex: true,
      analyticsEnabled: false,
      adsEnabled: false,
    });
  });

  it("rejects unsupported modes", () => {
    expect(() =>
      resolveBuildTargetConfig({ RELEASE_MODE: "staging" }, options),
    ).toThrow("Unsupported RELEASE_MODE: staging");
  });

  it("rejects ambiguous feature flags", () => {
    expect(() =>
      resolveBuildTargetConfig({ ENABLE_ADS: "yes" }, options),
    ).toThrow("ENABLE_ADS must be true or false");
  });
});
