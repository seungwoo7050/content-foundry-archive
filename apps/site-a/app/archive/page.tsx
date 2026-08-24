import type { Metadata } from "next";

import { createArchiveThemeViewModel } from "../../lib/archive-theme-view-model";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";
import { renderThemePage } from "../../lib/theme-page";

export function generateMetadata(): Metadata {
  const context = getVersionedSiteReleaseContext();
  const canonical = new URL("/archive", context.canonicalOrigin).href;
  const title = "전체 글";
  const description = `${context.bundle.site.name}에 게시된 안내 글을 최신순으로 모았습니다.`;
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

export default function ArchivePage() {
  const { bundle } = getVersionedSiteReleaseContext();
  return renderThemePage(bundle, createArchiveThemeViewModel(bundle));
}
