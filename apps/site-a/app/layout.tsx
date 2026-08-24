import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AnalyticsEventDispatcher } from "../components/analytics-event-dispatcher";
import { GoogleProviderHead } from "../components/google-provider-head";
import {
  createBuildConfigChecksum,
  createBuildConfigChecksumMetadata,
} from "../lib/build-config-checksum";
import {
  createReleaseIdentity,
  createReleaseIdentityMetadata,
} from "../lib/release-identity";
import { resolveBrandMediaAssets } from "../lib/brand-media-assets";
import { createSiteAnalyticsRouteProjection } from "../lib/site-analytics-route-projection";
import { createSiteBrandMetadata } from "../lib/site-brand-metadata";
import { resolveSiteLaunchConfig } from "../lib/site-launch-config";
import { getVersionedSiteReleaseContext } from "../lib/site-release";
import "./globals.css";

export function generateMetadata(): Metadata {
  const context = getVersionedSiteReleaseContext();
  const { bundle, canonicalOrigin, config } = context;
  const noindex = config.noindex;
  const identity = createReleaseIdentity(bundle);
  const launch = resolveSiteLaunchConfig(context, process.env);
  const buildConfigChecksum = createBuildConfigChecksum({ config, launch });
  const brand = createSiteBrandMetadata(
    canonicalOrigin,
    resolveBrandMediaAssets(bundle, context.mediaAssets),
  );

  return {
    metadataBase: new URL(canonicalOrigin),
    title: {
      default: bundle.site.name,
      template: `%s | ${bundle.site.name}`,
    },
    description: bundle.site.description,
    alternates: { canonical: "/" },
    ...(brand.favicon
      ? { icons: { icon: [brand.favicon] } }
      : {}),
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
      images: brand.socialImage ? [brand.socialImage] : [],
    },
    twitter: {
      card: brand.socialImage ? "summary_large_image" : "summary",
      title: bundle.site.name,
      description: bundle.site.description,
      images: brand.socialImage ? [brand.socialImage.url] : [],
    },
    other: {
      ...createReleaseIdentityMetadata(identity),
      ...createBuildConfigChecksumMetadata(buildConfigChecksum),
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const context = getVersionedSiteReleaseContext();
  const launch = resolveSiteLaunchConfig(context, process.env);

  return (
    <html lang={context.bundle.site.locale}>
      <head>
        <GoogleProviderHead
          analytics={launch.analytics}
          cmp={launch.cmp}
        />
      </head>
      <body>
        {launch.analytics.provider === "ga4" ? (
          <AnalyticsEventDispatcher
            projection={createSiteAnalyticsRouteProjection(context.bundle)}
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
