"use client";

import { useLayoutEffect, useState } from "react";

import {
  toGa4EventCall,
  type AnalyticsEventContext,
  type AnalyticsEventPayload,
} from "@content-foundry/analytics";
import { canLoadGoogleAnalytics } from "@content-foundry/site-core";

import type { SiteAnalyticsRouteProjection } from "../lib/site-analytics-route-projection";
import {
  registerGoogleCmpConsentCallback,
  type GoogleCmpWindow,
} from "../lib/use-google-cmp-consent";
import {
  createAnalyticsEventCandidate,
  createAnalyticsEventRuntime,
  type AnalyticsEventRuntime,
} from "./analytics-event-runtime";
import { GA4_PROVIDER_READY_EVENT } from "./ga4-tag";

export const ANALYTICS_EVENT_TYPE = "content-foundry:analytics-event";

type DetailOf<T> = T extends AnalyticsEventPayload
  ? Omit<T, keyof AnalyticsEventContext>
  : never;

export type AnalyticsEventDetail = DetailOf<AnalyticsEventPayload>;

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
  const event = createAnalyticsEventCandidate(context, detail);
  if (event === null) return false;

  try {
    gtag(...toGa4EventCall(event as AnalyticsEventPayload));
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

export function resolveInternalLinkEvent(
  projection: SiteAnalyticsRouteProjection,
  href: string,
  currentOrigin: string,
): AnalyticsEventDetail | null {
  const url = URL.parse(href, currentOrigin);
  if (
    url === null ||
    url.origin !== currentOrigin ||
    url.username.length > 0 ||
    url.password.length > 0
  ) return null;
  const destination = projection.routeDestinationsByPath[url.pathname];
  return destination
    ? { eventName: "internal_link_click", ...destination }
    : null;
}

export function resolveClassifiedExternalLinkEvent(
  data: Readonly<Record<string, string | undefined>>,
): AnalyticsEventDetail | null {
  if (
    data.analyticsEvent === "external_official_click" &&
    data.analyticsTargetId !== undefined
  ) {
    return {
      eventName: "external_official_click",
      targetId: data.analyticsTargetId,
    };
  }
  if (
    data.analyticsEvent === "affiliate_click" &&
    data.analyticsPartnerId !== undefined &&
    data.analyticsPlacement !== undefined
  ) {
    return {
      eventName: "affiliate_click",
      partnerId: data.analyticsPartnerId,
      placement: data.analyticsPlacement,
    };
  }
  return null;
}

export function AnalyticsEventDispatcher({
  projection,
}: {
  readonly projection: SiteAnalyticsRouteProjection;
}) {
  const [runtime] = useState<AnalyticsEventRuntime>(() => createAnalyticsEventRuntime((payload) => {
    const gtag = (window as unknown as { gtag?: unknown }).gtag;
    if (typeof gtag !== "function") return;
    try { gtag(...toGa4EventCall(payload)); } catch { /* provider failure is fail-closed */ }
  }));

  useLayoutEffect(() => {
    const captureCurrent = (detail: unknown) =>
      runtime.capture(
        resolveAnalyticsEventContext(projection, window.location.pathname),
        detail,
      );
    const handleEvent = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : undefined;
      captureCurrent(detail);
    };
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (anchor === null) return;
      const classified = resolveClassifiedExternalLinkEvent(anchor.dataset);
      if (classified !== null) {
        captureCurrent(classified);
        return;
      }
      const detail = resolveInternalLinkEvent(
        projection,
        anchor.href,
        window.location.origin,
      );
      if (detail !== null) captureCurrent(detail);
    };
    const handleProviderReady = () => {
      if (typeof (window as unknown as { gtag?: unknown }).gtag === "function") {
        runtime.providerReady();
      }
    };
    document.addEventListener(ANALYTICS_EVENT_TYPE, handleEvent);
    document.addEventListener(GA4_PROVIDER_READY_EVENT, handleProviderReady);
    document.addEventListener("click", handleClick);
    runtime.listenerReady();
    registerGoogleCmpConsentCallback(
      window as unknown as GoogleCmpWindow,
      (values) => runtime.updateConsent(values),
    );
    handleProviderReady();
    return () => {
      document.removeEventListener(ANALYTICS_EVENT_TYPE, handleEvent);
      document.removeEventListener(GA4_PROVIDER_READY_EVENT, handleProviderReady);
      document.removeEventListener("click", handleClick);
    };
  }, [projection, runtime]);

  return null;
}
