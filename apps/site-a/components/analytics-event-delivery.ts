import { createAnalyticsEventPayload, type AnalyticsEventPayload } from "@content-foundry/analytics";

export const ANALYTICS_DELIVERY_CAPACITY = 32;

export interface AnalyticsDeliveryState {
  readonly consentAllowed: boolean;
  readonly listenerReady: boolean;
  readonly providerReady: boolean;
  readonly bootstrap: readonly AnalyticsEventPayload[];
  readonly deferred: readonly AnalyticsEventPayload[];
}

export type AnalyticsDeliveryAction =
  | { readonly type: "capture"; readonly event: unknown }
  | { readonly type: "consent"; readonly allowed: boolean }
  | { readonly type: "listener-ready" }
  | { readonly type: "provider-ready" };

export const createAnalyticsDeliveryState = (): AnalyticsDeliveryState => ({
  consentAllowed: false,
  listenerReady: false,
  providerReady: false,
  bootstrap: [],
  deferred: [],
});

const boundedAppend = (
  events: readonly AnalyticsEventPayload[],
  event: AnalyticsEventPayload,
) => events.length < ANALYTICS_DELIVERY_CAPACITY ? [...events, event] : events;

export function transitionAnalyticsDelivery(
  state: AnalyticsDeliveryState,
  action: AnalyticsDeliveryAction,
) {
  if (action.type === "consent") {
    return {
      state: action.allowed
        ? { ...state, consentAllowed: true }
        : { ...state, consentAllowed: false, bootstrap: [], deferred: [] },
      deliveries: [],
    };
  }
  if (action.type === "capture") {
    let event: AnalyticsEventPayload;
    try { event = createAnalyticsEventPayload(action.event); }
    catch { return { state, deliveries: [] }; }
    if (!state.consentAllowed) return { state, deliveries: [] };
    if (!state.listenerReady) return {
      state: { ...state, bootstrap: boundedAppend(state.bootstrap, event) }, deliveries: [],
    };
    if (!state.providerReady) return {
      state: { ...state, deferred: boundedAppend(state.deferred, event) }, deliveries: [],
    };
    return { state, deliveries: [event] };
  }
  if (action.type === "listener-ready") {
    if (state.listenerReady) return { state, deliveries: [] };
    const granted = state.consentAllowed;
    const deliveries = granted && state.providerReady ? state.bootstrap : [];
    const deferred = granted && !state.providerReady ? state.bootstrap : [];
    return { state: { ...state, listenerReady: true, bootstrap: [], deferred }, deliveries };
  }
  const deliveries = state.consentAllowed && state.listenerReady ? state.deferred : [];
  return {
    state: { ...state, providerReady: true, deferred: deliveries.length ? [] : state.deferred },
    deliveries,
  };
}
