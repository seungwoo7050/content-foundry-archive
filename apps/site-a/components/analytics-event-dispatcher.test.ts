import {
  ANALYTICS_EVENT_CONTRACT_VERSION,
  type AnalyticsEventContext,
} from "@content-foundry/analytics";
import { describe, expect, it, vi } from "vitest";

import type { SiteAnalyticsRouteProjection } from "../lib/site-analytics-route-projection";
import {
  dispatchAnalyticsEvent,
  resolveAnalyticsEventContext,
  resolveInternalLinkEvent,
} from "./analytics-event-dispatcher";

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
const projection: SiteAnalyticsRouteProjection = {
  baseContext: {
    eventContractVersion: ANALYTICS_EVENT_CONTRACT_VERSION,
    siteId: "site-a",
    releaseId: "REL-2026-08-25",
    themeId: "friendly-mobile-utility",
    skinId: "calm-blue",
  },
  routeTypesByPath: {
    "/article/guide": "article",
    "/retired-guide": "retired",
  },
  routeDestinationsByPath: {
    "/article/guide": {
      destinationType: "article",
      destinationId: "ART-GUIDE-1",
    },
    "/category/daily-admin": {
      destinationType: "category",
      destinationId: "daily-admin",
    },
  },
};

describe("Site A analytics event dispatch", () => {
  it("resolves exact known paths and defaults unknown paths to not-found", () => {
    expect(resolveAnalyticsEventContext(projection, "/article/guide").routeType).toBe("article");
    expect(resolveAnalyticsEventContext(projection, "/retired-guide").routeType).toBe("retired");
    expect(resolveAnalyticsEventContext(projection, "/ARTICLE/GUIDE").routeType).toBe("not-found");
  });

  it("resolves only same-origin article and category destinations", () => {
    expect(resolveInternalLinkEvent(
      projection,
      "/article/guide?source=home#steps",
      "https://guides.example.kr",
    )).toEqual({
      eventName: "internal_link_click",
      destinationType: "article",
      destinationId: "ART-GUIDE-1",
    });
    expect(resolveInternalLinkEvent(
      projection,
      "https://guides.example.kr/category/daily-admin",
      "https://guides.example.kr",
    )).toEqual({
      eventName: "internal_link_click",
      destinationType: "category",
      destinationId: "daily-admin",
    });
    expect(resolveInternalLinkEvent(
      projection,
      "https://other.example/article/guide",
      "https://guides.example.kr",
    )).toBeNull();
    expect(resolveInternalLinkEvent(
      projection,
      "/about",
      "https://guides.example.kr",
    )).toBeNull();
  });

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
