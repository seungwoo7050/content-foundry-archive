import type { Metadata } from "next";
import type { ReactNode } from "react";

import { resolveConsentBuildConfig } from "@content-foundry/site-core";

import { GoogleProviderHead } from "../components/google-provider-head";
import {
  createReleaseIdentity,
  createReleaseIdentityMetadata,
} from "../lib/release-identity";
import { resolveSiteAnalyticsConfig } from "../lib/site-analytics-config";
import { resolveSiteGoogleCmpConfig } from "../lib/site-google-cmp-config";
import { getVersionedSiteReleaseContext } from "../lib/site-release";
import "./globals.css";

export function generateMetadata(): Metadata {
  const { bundle, canonicalOrigin, config } = getVersionedSiteReleaseContext();
  const noindex = config.noindex;
  const identity = createReleaseIdentity(bundle);
  const socialImage = new URL("/og.png", canonicalOrigin).href;

  return {
    metadataBase: new URL(canonicalOrigin),
    title: {
      default: bundle.site.name,
      template: `%s | ${bundle.site.name}`,
    },
    description: bundle.site.description,
    alternates: { canonical: "/" },
    robots: {
      index: !noindex,
      follow: !noindex,
    },
    openGraph: {
      type: "website",
      title: bundle.site.name,
      description: bundle.site.description,
      url: canonicalOrigin,
      locale: bundle.site.locale.replace("-", "_"),
      images: [
        {
          url: socialImage,
          width: 1729,
          height: 910,
          alt: "생활메모 — 실생활 정보를 차분하게 정리합니다",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: bundle.site.name,
      description: bundle.site.description,
      images: [socialImage],
    },
    other: createReleaseIdentityMetadata(identity),
  };
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const context = getVersionedSiteReleaseContext();
  const consent = resolveConsentBuildConfig(process.env);
  const analytics = resolveSiteAnalyticsConfig(context, consent);
  const cmp = resolveSiteGoogleCmpConfig(
    context.config.mode === "production",
    consent,
    context.bundle.site.ads,
  );

  return (
    <html lang={context.bundle.site.locale}>
      <head>
        <GoogleProviderHead analytics={analytics} cmp={cmp} />
      </head>
      <body>{children}</body>
    </html>
  );
}
