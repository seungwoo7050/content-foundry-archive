import {
  ANALYTICS_EVENT_CONTRACT_VERSION,
  type AnalyticsEventContext,
} from "@content-foundry/analytics";
import { describe, expect, it, vi } from "vitest";

import { dispatchAnalyticsEvent } from "./analytics-event-dispatcher";

const context: AnalyticsEventContext = {
  eventContractVersion: ANALYTICS_EVENT_CONTRACT_VERSION,
  siteId: "site-a",
  releaseId: "REL-2026-08-25",
  routeType: "article",
  themeId: "friendly-mobile-utility",
  skinId: "calm-blue",
};
const consent = {
  adStoragePurposeConsentStatus: 2,
  adUserDataPurposeConsentStatus: 2,
  adPersonalizationPurposeConsentStatus: 2,
  analyticsStoragePurposeConsentStatus: 1,
};
const detail = { eventName: "bookmark_local", articleId: "ART-GUIDE-1" };

describe("Site A analytics event dispatch", () => {
  it("sends a validated event after analytics consent", () => {
    const gtag = vi.fn();
    expect(dispatchAnalyticsEvent(consent, context, detail, gtag)).toBe(true);
    expect(gtag).toHaveBeenCalledWith("event", "bookmark_local", {
      article_id: "ART-GUIDE-1",
      event_contract_version: "1.0.0",
      release_id: "REL-2026-08-25",
      route_type: "article",
      site_id: "site-a",
      skin_id: "calm-blue",
      theme_id: "friendly-mobile-utility",
    });
  });

  it("drops events before or without analytics consent", () => {
    const gtag = vi.fn();
    expect(dispatchAnalyticsEvent(undefined, context, detail, gtag)).toBe(false);
    expect(dispatchAnalyticsEvent({ ...consent, analyticsStoragePurposeConsentStatus: 2 }, context, detail, gtag)).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it("drops malformed detail and a missing gtag without queueing", () => {
    const gtag = vi.fn();
    expect(dispatchAnalyticsEvent(consent, context, { ...detail, rawQuery: "secret" }, gtag)).toBe(false);
    expect(dispatchAnalyticsEvent(consent, context, { ...detail, siteId: "other-site" }, gtag)).toBe(false);
    expect(dispatchAnalyticsEvent(consent, context, detail, undefined)).toBe(false);
    expect(dispatchAnalyticsEvent(consent, context, detail, "not-a-function")).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });
});
