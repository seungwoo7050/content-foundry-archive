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

  it("forces preview tracking and advertising off", () => {
    const config = resolveBuildTargetConfig(
      {
        RELEASE_MODE: "preview",
        CONTENT_RELEASE_DIR: "/releases/preview",
        SITE_ORIGIN: "https://preview.example.org",
        ENABLE_ANALYTICS: "true",
        ENABLE_ADS: "true",
      },
      options,
    );

    expect(config).toMatchObject({
      mode: "preview",
      noindex: true,
      analyticsEnabled: false,
      adsEnabled: false,
    });
  });

  it("requires an explicit release outside template mode", () => {
    expect(() => resolveBuildTargetConfig({ RELEASE_MODE: "preview" }, options)).toThrow(
      "CONTENT_RELEASE_DIR is required in preview mode",
    );
  });

  it("defers production policy to its own boundary", () => {
    expect(() =>
      resolveBuildTargetConfig(
        {
          RELEASE_MODE: "production",
          CONTENT_RELEASE_DIR: "/releases/production",
        },
        options,
      ),
    ).toThrow("production release policy is not configured");
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
