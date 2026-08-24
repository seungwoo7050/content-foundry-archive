import type { Metadata } from "next";

import type { MetadataContext } from "./metadata-context";

export function createSearchMetadata(context: MetadataContext): Metadata {
  const title = "검색";
  const description = "사이트에 게시된 안내를 기기 안에서 검색합니다.";
  const canonical = new URL("/search", context.canonicalOrigin).href;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: false, follow: !context.config.noindex },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: [],
    },
    twitter: { card: "summary", title, description, images: [] },
  };
}
