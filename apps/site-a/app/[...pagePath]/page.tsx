import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VersionedContentBlocks } from "../../components/versioned-content-blocks";
import { findGoneRoute } from "../../lib/gone-route";
import type { VersionedSiteReleaseContext } from "../../lib/load-site-release";
import { createPageMetadata } from "../../lib/page-metadata";
import {
  findPageByPathSegments,
  getPageRouteStaticParams,
} from "../../lib/page-route";
import { createRetiredRouteMetadata } from "../../lib/retired-route-metadata";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";
import { createStaticPageThemeViewModel } from "../../lib/static-page-theme-view-model";
import { createRetiredThemeViewModel } from "../../lib/status-theme-view-model";
import { renderThemePage } from "../../lib/theme-page";

export const dynamicParams = false;

interface StaticPageProps {
  params: Promise<{ pagePath: string[] }>;
}

export function generateStaticParams() {
  return getPageRouteStaticParams(getVersionedSiteReleaseContext().bundle);
}

export async function generateMetadata({
  params,
}: StaticPageProps): Promise<Metadata> {
  const { pagePath } = await params;
  const context = getVersionedSiteReleaseContext();
  const page = findPageByPathSegments(context.bundle, pagePath);

  if (!page) {
    if (findGoneRoute(context.bundle, `/${pagePath.join("/")}`)) {
      return createRetiredRouteMetadata();
    }
    notFound();
  }

  return createPageMetadata(context, page);
}

function renderPageContent(
  context: VersionedSiteReleaseContext,
  pagePath: readonly string[],
) {
  if (context.contractVersion === "3.0.0") {
    const page = findPageByPathSegments(context.bundle, pagePath);
    if (!page) notFound();
    return (
      <VersionedContentBlocks
        blocks={page.content}
        context={{
          mediaAssets: context.mediaAssets,
          nicheComponents: context.nicheComponents,
          siteId: context.bundle.release.siteId,
        }}
        contractVersion="3.0.0"
      />
    );
  }

  const page = findPageByPathSegments(context.bundle, pagePath);
  if (!page) notFound();
  return <VersionedContentBlocks blocks={page.content} contractVersion="2.0.0" />;
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { pagePath } = await params;
  const context = getVersionedSiteReleaseContext();
  const { bundle } = context;
  const page = findPageByPathSegments(bundle, pagePath);

  if (!page) {
    const retiredRoute = findGoneRoute(bundle, `/${pagePath.join("/")}`);
    if (retiredRoute) {
      return renderThemePage(
        bundle,
        createRetiredThemeViewModel(bundle, retiredRoute),
      );
    }
    notFound();
  }

  return renderThemePage(
    bundle,
    createStaticPageThemeViewModel(
      context,
      page,
      renderPageContent(context, pagePath),
    ),
  );
}
