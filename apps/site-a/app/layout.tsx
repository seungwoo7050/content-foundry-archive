import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getSiteReleaseContext } from "../lib/site-release";
import "./globals.css";

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
      <body>
        <a href="#main-content">본문으로 바로가기</a>
        <header>
          {/* Static export intentionally uses native navigation without client code. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" aria-label={`${bundle.site.name} 홈`}>
            {bundle.site.name}
          </a>
          <p>{bundle.site.description}</p>
        </header>
        <main id="main-content">{children}</main>
        <footer>
          <small>© 2026 {bundle.site.name}</small>
        </footer>
      </body>
    </html>
  );
}
