import type {
  AnalyticsEventContext,
  AnalyticsEventPayload,
} from "@content-foundry/analytics";
import { canLoadGoogleAnalytics } from "@content-foundry/site-core";

import {
  createAnalyticsDeliveryState,
  transitionAnalyticsDelivery,
  type AnalyticsDeliveryAction,
} from "./analytics-event-delivery";

const CONTEXT_KEYS: ReadonlyArray<keyof AnalyticsEventContext> = [
  "eventContractVersion", "siteId", "releaseId", "routeType", "themeId", "skinId",
];

export function createAnalyticsEventCandidate(
  context: AnalyticsEventContext,
  detail: unknown,
): unknown | null {
  if (typeof detail !== "object" || detail === null || Array.isArray(detail)) {
    return null;
  }
  if (CONTEXT_KEYS.some((key) => key in detail)) return null;
  return { ...detail, ...context };
}

export interface AnalyticsEventRuntime {
  capture(context: AnalyticsEventContext, detail: unknown): void;
  listenerReady(): void;
  providerReady(): void;
  updateConsent(values: unknown): void;
}

export function createAnalyticsEventRuntime(
  deliver: (payload: AnalyticsEventPayload) => void,
): AnalyticsEventRuntime {
  let state = createAnalyticsDeliveryState();
  const advance = (action: AnalyticsDeliveryAction) => {
    const transition = transitionAnalyticsDelivery(state, action);
    state = transition.state;
    transition.deliveries.forEach(deliver);
  };

  return {
    capture(context, detail) {
      const event = createAnalyticsEventCandidate(context, detail);
      if (event !== null) advance({ type: "capture", event });
    },
    listenerReady: () => advance({ type: "listener-ready" }),
    providerReady: () => advance({ type: "provider-ready" }),
    updateConsent: (values) => advance({
      type: "consent",
      allowed: canLoadGoogleAnalytics(values),
    }),
  };
}
