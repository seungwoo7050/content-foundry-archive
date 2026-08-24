"use client";

import { useCallback } from "react";

import {
  AnalyticsConfigError,
  isGa4MeasurementId,
  type AnalyticsProviderConfig,
} from "@content-foundry/analytics";
import { canLoadGoogleAnalytics } from "@content-foundry/site-core";

import { useGoogleCmpConsent } from "../lib/use-google-cmp-consent";

interface Ga4Window {
  dataLayer?: unknown[];
  gtag?: (...parameters: unknown[]) => void;
}

const GA4_SCRIPT_SELECTOR = 'script[data-content-foundry-provider="ga4"]';

export function loadGa4(
  documentTarget: Document,
  windowTarget: Ga4Window,
  measurementId: string,
): boolean {
  if (!isGa4MeasurementId(measurementId)) {
    throw new AnalyticsConfigError("GA4 loader requires a valid measurement ID");
  }
  if (documentTarget.querySelector(GA4_SCRIPT_SELECTOR)) return false;

  windowTarget.dataLayer ??= [];
  windowTarget.gtag ??= (...parameters: unknown[]) => {
    windowTarget.dataLayer?.push(parameters);
  };
  windowTarget.gtag("js", new Date());
  windowTarget.gtag("config", measurementId);

  const script = documentTarget.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.setAttribute("data-content-foundry-provider", "ga4");
  documentTarget.head.append(script);
  return true;
}

function EnabledGa4Tag({ measurementId }: { readonly measurementId: string }) {
  const handleConsent = useCallback((values: unknown) => {
    if (canLoadGoogleAnalytics(values)) {
      loadGa4(document, window as unknown as Ga4Window, measurementId);
    }
  }, [measurementId]);
  useGoogleCmpConsent(handleConsent);
  return null;
}

export function Ga4Tag({
  config,
}: {
  readonly config: AnalyticsProviderConfig;
}) {
  if (config.provider === "disabled") return null;
  if (!isGa4MeasurementId(config.publicMeasurementId)) {
    throw new AnalyticsConfigError("GA4 tag requires a valid measurement ID");
  }
  return <EnabledGa4Tag measurementId={config.publicMeasurementId} />;
}
