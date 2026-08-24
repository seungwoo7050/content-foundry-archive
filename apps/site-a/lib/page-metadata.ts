import type { Metadata } from "next";

import type { MetadataContext } from "./metadata-context";

export interface PageMetadataSource {
  readonly seo: {
    readonly canonicalPath: string;
    readonly title: string;
    readonly description: string;
    readonly index: boolean;
    readonly follow: boolean;
  };
}

export function createPageMetadata(
  context: MetadataContext,
  page: PageMetadataSource,
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
