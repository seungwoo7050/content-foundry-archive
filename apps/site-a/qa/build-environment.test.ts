import { describe, expect, it } from "vitest";

import { createQaBuildEnvironment } from "./build-environment";

const removedKeys = [
  "CI",
  "INIT_CWD",
  "CONTENT_RELEASE_V3_CONSUMER_CONTEXT_FILE",
  "IMMUTABLE_MEDIA_DIR",
  "SITE_ALLOWED_PRODUCTION_ORIGINS",
  "CONSENT_PROVIDER",
  "CONSENT_CONFIG_REVISION",
  "ADSENSE_MANUAL_UNITS",
  "SITE_OWNED_GA4_MEASUREMENT_ID",
  "SITE_OWNED_ADSENSE_CLIENT_ID",
  "GOOGLE_CMP_READY",
  "ADSENSE_AUTO_ADS_ENABLED",
  "ADSENSE_SITE_READY",
] as const;

const previewFacts = Object.freeze({
  RELEASE_MODE: "preview" as const,
  CONTENT_RELEASE_DIR: "/qa/releases/friendly-mobile-utility--calm-blue",
  SITE_ORIGIN: "https://friendly-mobile-utility-calm-blue.qa.public-sites.example" as const,
  ENABLE_ANALYTICS: "false" as const,
  ENABLE_ADS: "false" as const,
});

describe("createQaBuildEnvironment", () => {
  it("removes inherited build and provider state before applying preview facts", () => {
    const inherited: Record<string, string> = {
      ...Object.fromEntries(removedKeys.map((key) => [key, "remove-me"])),
      RELEASE_MODE: "production",
      CONTENT_RELEASE_DIR: "/production/release",
      SITE_ORIGIN: "https://production.invalid",
      ENABLE_ANALYTICS: "true",
      ENABLE_ADS: "true",
      PATH: "/runtime/bin",
      RUNTIME_SENTINEL: "preserve-me",
    };
    const environment = createQaBuildEnvironment(inherited, previewFacts);
    expect(removedKeys.filter((key) => key in environment)).toEqual([]);
    expect(environment).toEqual({
      PATH: "/runtime/bin",
      RUNTIME_SENTINEL: "preserve-me",
      ...previewFacts,
    });
    expect(inherited.CI).toBe("remove-me");
  });

  it("returns an immutable copy without creating provider values", () => {
    const inherited = { PATH: "/runtime/bin", NODE_OPTIONS: "--no-warnings" };
    const environment = createQaBuildEnvironment(inherited, previewFacts);
    expect(environment).not.toBe(inherited);
    expect(Object.isFrozen(environment)).toBe(true);
    expect(environment).toEqual({ ...inherited, ...previewFacts });
  });
});
