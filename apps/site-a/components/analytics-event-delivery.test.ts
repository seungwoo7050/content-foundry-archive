import { describe, expect, it } from "vitest";

import {
  ANALYTICS_DELIVERY_CAPACITY,
  createAnalyticsDeliveryState,
  transitionAnalyticsDelivery,
} from "./analytics-event-delivery";

const context = {
  eventContractVersion: "1.0.0",
  siteId: "site-a",
  releaseId: "REL-2026-000042",
  routeType: "article",
  themeId: "minimal-knowledge-base",
  skinId: "calm-blue",
} as const;
const event = (index: number) => ({
  ...context,
  eventName: "bookmark_local",
  articleId: `ART-GUIDE-${index}`,
});
const step = (
  state: ReturnType<typeof createAnalyticsDeliveryState>,
  action: Parameters<typeof transitionAnalyticsDelivery>[1],
) =>
  transitionAnalyticsDelivery(state, action);

describe("analytics event delivery boundary", () => {
  it("drops pre-consent events and flushes only a bounded granted FIFO", () => {
    let state = step(createAnalyticsDeliveryState(), { type: "capture", event: event(0) }).state;
    state = step(state, { type: "consent", allowed: true }).state;
    for (let index = 1; index <= ANALYTICS_DELIVERY_CAPACITY + 1; index += 1) {
      state = step(state, { type: "capture", event: event(index) }).state;
    }
    state = step(state, { type: "listener-ready" }).state;
    state = step(state, { type: "capture", event: event(99) }).state;
    const ready = step(state, { type: "provider-ready" });
    expect(ready.deliveries.map((payload) =>
      payload.eventName === "bookmark_local" ? payload.articleId : "unexpected",
    )).toEqual(Array.from(
      { length: ANALYTICS_DELIVERY_CAPACITY }, (_, index) => `ART-GUIDE-${index + 1}`,
    ));
    expect(ready.state.deferred).toEqual([]);
  });

  it("drains granted bootstrap events at registration and clears them on revoke", () => {
    let state = step(createAnalyticsDeliveryState(), { type: "consent", allowed: true }).state;
    state = step(state, { type: "capture", event: event(1) }).state;
    state = step(state, { type: "provider-ready" }).state;
    const registered = step(state, { type: "listener-ready" });
    expect(registered.deliveries).toHaveLength(1);
    state = step(createAnalyticsDeliveryState(), { type: "consent", allowed: true }).state;
    state = step(state, { type: "listener-ready" }).state;
    state = step(state, { type: "capture", event: event(2) }).state;
    state = step(state, { type: "consent", allowed: false }).state;
    state = step(state, { type: "consent", allowed: true }).state;
    expect(step(state, { type: "capture", event: { eventName: "bookmark_local" } }))
      .toEqual({ state, deliveries: [] });
    expect(step(state, { type: "provider-ready" }).deliveries).toEqual([]);
  });
});
