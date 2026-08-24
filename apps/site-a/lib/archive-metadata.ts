import type { Metadata } from "next";

import type { MetadataContext } from "./metadata-context";
import { getStaticListPagePath } from "./static-list-pagination";

export interface ArchiveMetadataContext extends MetadataContext {
  readonly bundle: { readonly site: { readonly name: string } };
}

export function createArchiveMetadata(
  context: ArchiveMetadataContext,
  currentPage = 1,
): Metadata {
  const path = getStaticListPagePath("/archive", currentPage);
  const canonical = new URL(path, context.canonicalOrigin).href;
  const title = currentPage === 1 ? "전체 글" : `전체 글 ${currentPage}페이지`;
  const baseDescription = `${context.bundle.site.name}에 게시된 안내 글을 최신순으로 모았습니다.`;
  const description = currentPage === 1
    ? baseDescription
    : `${baseDescription} ${currentPage}페이지입니다.`;
  const index = !context.config.noindex;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index, follow: index },
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
