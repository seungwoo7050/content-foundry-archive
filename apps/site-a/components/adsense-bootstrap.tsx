"use client";

import { useEffect } from "react";

import {
  AdvertisingConfigError,
  isAdSensePublicClientId,
} from "@content-foundry/advertising";

const ADSENSE_SCRIPT_SELECTOR =
  'script[data-content-foundry-provider="adsense"]';

export function loadAdSenseBootstrap(
  documentTarget: Document,
  publicClientId: string,
): boolean {
  if (!isAdSensePublicClientId(publicClientId)) {
    throw new AdvertisingConfigError(
      "AdSense bootstrap requires a valid public client ID",
    );
  }
  if (documentTarget.querySelector(ADSENSE_SCRIPT_SELECTOR)) return false;

  const script = documentTarget.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publicClientId}`;
  script.setAttribute("data-content-foundry-provider", "adsense");
  documentTarget.head.append(script);
  return true;
}

export function AdSenseBootstrap({
  publicClientId,
}: {
  readonly publicClientId: string | null;
}) {
  if (publicClientId !== null && !isAdSensePublicClientId(publicClientId)) {
    throw new AdvertisingConfigError(
      "AdSense bootstrap requires a valid public client ID",
    );
  }
  useEffect(() => {
    if (publicClientId !== null) {
      loadAdSenseBootstrap(document, publicClientId);
    }
  }, [publicClientId]);
  return publicClientId === null
    ? null
    : <meta name="google-adsense-account" content={publicClientId} />;
}
