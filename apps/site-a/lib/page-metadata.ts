import type { PublishedStaticPageProjection } from "@content-foundry/content-contract";
import type { Metadata } from "next";

import type { SiteReleaseContext } from "./load-site-release";

export function createPageMetadata(
  context: SiteReleaseContext,
  page: PublishedStaticPageProjection,
): Metadata {
  const canonical = new URL(page.seo.canonicalPath, context.canonicalOrigin).href;
  const index = !context.config.noindex && page.seo.index;
  const follow = !context.config.noindex && page.seo.follow;

  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: { canonical },
    robots: { index, follow },
    openGraph: {
      type: "website",
      title: page.seo.title,
      description: page.seo.description,
      url: canonical,
      images: [],
    },
    twitter: {
      card: "summary",
      title: page.seo.title,
      description: page.seo.description,
      images: [],
    },
  };
}
