"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  toGa4EventCall,
  type AnalyticsEventContext,
  type AnalyticsEventPayload,
} from "@content-foundry/analytics";
import { canLoadGoogleAnalytics } from "@content-foundry/site-core";

import type { SiteAnalyticsRouteProjection } from "../lib/site-analytics-route-projection";
import { useGoogleCmpConsent } from "../lib/use-google-cmp-consent";

export const ANALYTICS_EVENT_TYPE = "content-foundry:analytics-event";

type DetailOf<T> = T extends AnalyticsEventPayload
  ? Omit<T, keyof AnalyticsEventContext>
  : never;

export type AnalyticsEventDetail = DetailOf<AnalyticsEventPayload>;

const CONTEXT_KEYS: ReadonlyArray<keyof AnalyticsEventContext> = [
  "eventContractVersion", "siteId", "releaseId", "routeType", "themeId", "skinId",
];

export function emitAnalyticsEvent(detail: AnalyticsEventDetail): boolean {
  return document.dispatchEvent(new CustomEvent(ANALYTICS_EVENT_TYPE, {
    detail,
  }));
}

export function dispatchAnalyticsEvent(
  consent: unknown,
  context: AnalyticsEventContext,
  detail: unknown,
  gtag: unknown,
): boolean {
  if (!canLoadGoogleAnalytics(consent) || typeof gtag !== "function") return false;
  if (typeof detail !== "object" || detail === null || Array.isArray(detail)) {
    return false;
  }
  if (CONTEXT_KEYS.some((key) => key in detail)) return false;

  try {
    gtag(...toGa4EventCall({ ...detail, ...context } as AnalyticsEventPayload));
    return true;
  } catch {
    return false;
  }
}

export function resolveAnalyticsEventContext(
  projection: SiteAnalyticsRouteProjection,
  pathname: string,
): AnalyticsEventContext {
  return {
    ...projection.baseContext,
    routeType: projection.routeTypesByPath[pathname] ?? "not-found",
  };
}

export function AnalyticsEventDispatcher({
  projection,
}: {
  readonly projection: SiteAnalyticsRouteProjection;
}) {
  const consent = useRef<unknown>(undefined);
  const rememberConsent = useCallback((values: unknown) => {
    consent.current = values;
  }, []);
  useGoogleCmpConsent(rememberConsent);

  useEffect(() => {
    const handleEvent = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : undefined;
      dispatchAnalyticsEvent(
        consent.current,
        resolveAnalyticsEventContext(projection, window.location.pathname),
        detail,
        (window as unknown as { gtag?: unknown }).gtag,
      );
    };
    document.addEventListener(ANALYTICS_EVENT_TYPE, handleEvent);
    return () => document.removeEventListener(ANALYTICS_EVENT_TYPE, handleEvent);
  }, [projection]);

  return null;
}
