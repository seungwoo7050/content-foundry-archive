import type { Metadata } from "next";
import type { ReactNode } from "react";

import {
  createReleaseIdentity,
  createReleaseIdentityMetadata,
} from "../lib/release-identity";
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
  const { bundle } = getVersionedSiteReleaseContext();

  return (
    <html lang={bundle.site.locale}>
      <body>{children}</body>
    </html>
  );
}
