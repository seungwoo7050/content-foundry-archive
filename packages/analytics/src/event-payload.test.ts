import { describe, expect, expectTypeOf, it } from "vitest";

import {
  ANALYTICS_EVENT_CONTRACT_VERSION, ANALYTICS_EVENT_NAMES,
  AnalyticsEventContractError, createAnalyticsEventPayload,
  type AnalyticsEventPayload,
} from "./event-payload.js";

const context = { eventContractVersion: "1.0.0", siteId: "site-a", releaseId: "REL-2026-000043", routeType: "article", themeId: "friendly-mobile-utility", skinId: "calm-blue" } as const;
const cases = [
  ["article_engaged", { articleId: "ART-GUID-1" }], ["scroll_depth", { articleId: "ART-000123", depthPercent: 75 }],
  ["internal_link_click", { destinationType: "category", destinationId: "life-admin" }], ["external_official_click", { targetId: "government24" }],
  ["affiliate_click", { partnerId: "partner-a", placement: "article-end" }], ["search_submit", { queryCategory: "administration" }],
  ["search_result_click", { articleId: "ART-000123", resultPosition: 2 }], ["share_click", { articleId: "ART-000123", channel: "copy-link" }],
  ["bookmark_local", { articleId: "ART-000123" }], ["article_feedback", { articleId: "ART-000123", feedback: "helpful" }],
  ["ad_slot_viewability", { slotId: "article-end" }],
] as const;

describe("provider-neutral analytics event payload", () => {
  it("freezes the versioned eleven-event vocabulary", () => {
    expect(ANALYTICS_EVENT_CONTRACT_VERSION).toBe("1.0.0");
    expect(ANALYTICS_EVENT_NAMES).toHaveLength(11);
    expect(ANALYTICS_EVENT_NAMES).not.toContain("page_view");
  });

  it.each(cases)("validates and freezes %s", (eventName, details) => {
    const payload = createAnalyticsEventPayload({ ...context, eventName, ...details });
    expect(payload).toEqual({ ...context, eventName, ...details });
    expect(Object.isFrozen(payload)).toBe(true);
    expectTypeOf(payload).toEqualTypeOf<AnalyticsEventPayload>();
  });

  it.each([
    { ...context, eventName: "search_submit", query: "raw private words" },
    { ...context, eventName: "article_engaged", articleId: "ART-000123", title: "금지된 제목" },
    { ...context, eventName: "external_official_click", targetId: "a".repeat(65) },
    { ...context, eventName: "scroll_depth", articleId: "ART-000123", depthPercent: 100 },
    { ...context, eventName: "search_result_click", articleId: "ART-000123", resultPosition: 0 },
    { ...context, eventName: "bookmark_local", articleId: "ART-000123", storedValue: true },
    { ...context, eventName: "page_view" },
  ])("fails closed for malformed or sensitive payload %#", (payload) => {
    expect(() => createAnalyticsEventPayload(payload)).toThrow(AnalyticsEventContractError);
  });
});
