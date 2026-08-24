import { describe, expect, expectTypeOf, it } from "vitest";

import {
  CONSENT_PROVIDERS,
  type ConsentBuildConfig,
  type ConsentProvider,
  resolveConsentBuildConfig,
} from "./consent-config.js";
import { BuildTargetConfigError } from "./release-mode.js";

describe("provider-neutral consent build config", () => {
  it("defaults missing consent variables to a disabled projection", () => {
    const config = resolveConsentBuildConfig({
      CONSENT_PROVIDER_ACCOUNT_ID: "must-not-leak",
    });

    expect(config).toEqual({ provider: "disabled", configRevision: null });
    expect(Object.keys(config)).toEqual(["provider", "configRevision"]);
    expect(config).not.toHaveProperty("environment");
    expect(config).not.toHaveProperty("accountId");
    expect(resolveConsentBuildConfig({ CONSENT_PROVIDER: "disabled" })).toEqual(config);
  });

  it("accepts an exact google-cmp provider and bounded opaque revision", () => {
    expect(resolveConsentBuildConfig({
      CONSENT_PROVIDER: "google-cmp",
      CONSENT_CONFIG_REVISION: "r".repeat(128),
    })).toEqual({
      provider: "google-cmp",
      configRevision: "r".repeat(128),
    });
    expect(CONSENT_PROVIDERS).toEqual(["disabled", "google-cmp"]);
    expectTypeOf<ConsentProvider>().toEqualTypeOf<"disabled" | "google-cmp">();
    expectTypeOf<ReturnType<typeof resolveConsentBuildConfig>>()
      .toEqualTypeOf<ConsentBuildConfig>();
  });

  it.each(["", "revision-1"])(
    "rejects revision %j while consent is disabled",
    (revision) => {
      expect(() => resolveConsentBuildConfig({
        CONSENT_PROVIDER: "disabled",
        CONSENT_CONFIG_REVISION: revision,
      })).toThrow(BuildTargetConfigError);
    },
  );

  it.each([undefined, "", " ", "revision 1", "revision\n1", "revision\u00001", "revision\u200B1", "r".repeat(129)])(
    "rejects unsafe google-cmp revision %j",
    (revision) => {
      expect(() => resolveConsentBuildConfig({
        CONSENT_PROVIDER: "google-cmp",
        CONSENT_CONFIG_REVISION: revision,
      })).toThrow(BuildTargetConfigError);
    },
  );

  it.each(["", "other", "Google-CMP", " google-cmp"])(
    "rejects unknown provider %j without coercion",
    (provider) => {
      expect(() => resolveConsentBuildConfig({
        CONSENT_PROVIDER: provider,
      })).toThrow(BuildTargetConfigError);
    },
  );

  it("rejects an orphan revision when the provider variable is missing", () => {
    expect(() => resolveConsentBuildConfig({
      CONSENT_CONFIG_REVISION: "revision-1",
    })).toThrow(BuildTargetConfigError);
  });
});
