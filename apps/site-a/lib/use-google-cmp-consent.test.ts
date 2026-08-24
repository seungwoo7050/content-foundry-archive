import { describe, expect, it, vi } from "vitest";

import {
  registerGoogleCmpConsentCallback,
  type GoogleCmpWindow,
} from "./use-google-cmp-consent";

describe("Google CMP callback registration", () => {
  it("queues the supported consent-mode readiness callback", () => {
    const values = { analyticsStoragePurposeConsentStatus: 1 };
    const callback = vi.fn();
    const entries: Array<{ CONSENT_MODE_DATA_READY: () => void }> = [];
    const target: GoogleCmpWindow = {
      googlefc: {
        callbackQueue: { push: (entry) => entries.push(entry) },
        getGoogleConsentModeValues: () => values,
      },
    };

    registerGoogleCmpConsentCallback(target, callback);
    expect(entries).toHaveLength(1);
    entries[0]?.CONSENT_MODE_DATA_READY();
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(values);
  });

  it("initializes the namespace and fails closed when values are unavailable", () => {
    const callback = vi.fn();
    const target: GoogleCmpWindow = {};

    registerGoogleCmpConsentCallback(target, callback);
    expect(target.googlefc?.callbackQueue).toBeDefined();
    const queue = target.googlefc?.callbackQueue as unknown as Array<{
      CONSENT_MODE_DATA_READY: () => void;
    }>;
    queue[0]?.CONSENT_MODE_DATA_READY();
    expect(callback).toHaveBeenCalledWith(undefined);
  });
});
