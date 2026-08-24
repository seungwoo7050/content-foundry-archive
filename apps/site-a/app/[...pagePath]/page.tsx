import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { findGoneRoute } from "../../lib/gone-route";
import { createPageMetadata } from "../../lib/page-metadata";
import {
  findPageByPathSegments,
  getPageRouteStaticParams,
} from "../../lib/page-route";
import { createRetiredRouteMetadata } from "../../lib/retired-route-metadata";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";
import { renderStaticPageContent } from "../../lib/static-page-content";
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
      renderStaticPageContent(context, pagePath),
    ),
  );
}
