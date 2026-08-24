import { describe, expect, it } from "vitest";

import { AnalyticsEventContractError } from "./event-payload.js";
import { toGa4EventCall } from "./ga4-event.js";

const context = {
  eventContractVersion: "1.0.0",
  siteId: "site-a",
  releaseId: "REL-2026-000043",
  routeType: "article",
  themeId: "friendly-mobile-utility",
  skinId: "calm-blue",
} as const;
const event = {
  ...context,
  eventName: "scroll_depth",
  articleId: "ART-000123",
  depthPercent: 75,
} as const;

describe("GA4 custom event adapter", () => {
  it("maps validated context and details to one frozen snake-case call", () => {
    const call = toGa4EventCall(event);

    expect(call).toEqual(["event", "scroll_depth", {
      article_id: "ART-000123",
      depth_percent: 75,
      event_contract_version: "1.0.0",
      release_id: "REL-2026-000043",
      route_type: "article",
      site_id: "site-a",
      skin_id: "calm-blue",
      theme_id: "friendly-mobile-utility",
    }]);
    expect(Object.isFrozen(call)).toBe(true);
    expect(Object.isFrozen(call[2])).toBe(true);
    expect(Object.keys(call[2]).every((key) => /^[a-z][a-z0-9_]*$/.test(key))).toBe(true);
    expect(call[2]).not.toHaveProperty("event_name");
    expect(Object.values(call[2])).not.toContain(undefined);
  });

  it("is deterministic when equivalent input keys use a different order", () => {
    const reordered = {
      eventName: "scroll_depth", depthPercent: 75, articleId: "ART-000123",
      skinId: "calm-blue", themeId: "friendly-mobile-utility",
      routeType: "article", releaseId: "REL-2026-000043",
      siteId: "site-a", eventContractVersion: "1.0.0",
    } as const;

    expect(JSON.stringify(toGa4EventCall(reordered))).toBe(JSON.stringify(toGa4EventCall(event)));
  });

  it.each([
    { ...event, title: "Private title" },
    { ...event, url: "https://example.test/private" },
    { ...context, eventName: "search_submit", queryCategory: "admin", query: "raw words" },
    { ...event, articleId: undefined },
  ])("revalidates and rejects forbidden or undefined input %#", (value) => {
    expect(() => toGa4EventCall(value as never)).toThrow(AnalyticsEventContractError);
  });
});
