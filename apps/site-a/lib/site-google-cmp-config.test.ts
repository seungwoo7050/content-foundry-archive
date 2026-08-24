import { AdvertisingConfigError } from "@content-foundry/advertising";
import { describe, expect, it } from "vitest";

import { resolveSiteGoogleCmpConfig } from "./site-google-cmp-config";

const consent = {
  provider: "google-cmp",
  configRevision: "sha256:consent-a",
} as const;

describe("Site A Google CMP bootstrap configuration", () => {
  it("keeps disabled consent identity-free", () => {
    expect(resolveSiteGoogleCmpConfig(true,
      { provider: "disabled", configRevision: null },
      "not-an-identity",
    )).toEqual({ provider: "disabled", publicClientId: null });
  });

  it.each([false, true])(
    "binds a valid public identity independently of ad delivery %s",
    (enabled) => {
      expect(resolveSiteGoogleCmpConfig(true, consent, {
        provider: "adsense",
        enabled,
        publicClientId: "ca-pub-1234567890123456",
      })).toEqual({
        provider: "google-cmp",
        publicClientId: "ca-pub-1234567890123456",
      });
    },
  );

  it("keeps template and preview builds provider-free", () => {
    expect(resolveSiteGoogleCmpConfig(false, consent, {
      provider: "adsense",
      enabled: true,
      publicClientId: "ca-pub-1234567890123456",
    })).toEqual({ provider: "disabled", publicClientId: null });
  });

  it.each([
    undefined,
    null,
    {},
    { provider: "disabled", enabled: false, publicClientId: null },
    { provider: "adsense", enabled: false, publicClientId: "ca-pub-forged" },
    {
      provider: "adsense",
      enabled: false,
      publicClientId: "ca-pub-1234567890123456",
      extra: true,
    },
  ])("fails closed for a mismatched release identity %#", (identity) => {
    expect(() => resolveSiteGoogleCmpConfig(true, consent, identity)).toThrow(
      AdvertisingConfigError,
    );
  });
});
