import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getSiteReleaseContext } from "../lib/site-release";

export function generateMetadata(): Metadata {
  const { bundle, canonicalOrigin, config } = getSiteReleaseContext();
  const noindex = config.noindex;

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
  };
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { bundle } = getSiteReleaseContext();

  return (
    <html lang={bundle.site.locale}>
      <body>{children}</body>
    </html>
  );
}
