import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createArchiveMetadata } from "../../lib/archive-metadata";
import { createArchiveThemeViewModel } from "../../lib/archive-theme-view-model";
import { createCategoryMetadata } from "../../lib/category-metadata";
import { createCategoryThemeViewModel } from "../../lib/category-theme-view-model";
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
import {
  getStaticPaginationCatchAllParams,
  resolveStaticPaginationCatchAll,
} from "../../lib/static-pagination-catch-all";
import { createRetiredThemeViewModel } from "../../lib/status-theme-view-model";
import { renderThemePage } from "../../lib/theme-page";

export const dynamicParams = false;

interface StaticPageProps {
  params: Promise<{ pagePath: string[] }>;
}

export function generateStaticParams() {
  const { bundle } = getVersionedSiteReleaseContext();
  return [
    ...getPageRouteStaticParams(bundle),
    ...getStaticPaginationCatchAllParams(bundle),
  ];
}

export async function generateMetadata({
  params,
}: StaticPageProps): Promise<Metadata> {
  const { pagePath } = await params;
  const context = getVersionedSiteReleaseContext();
  const page = findPageByPathSegments(context.bundle, pagePath);

  if (page) return createPageMetadata(context, page);

  const pagination = resolveStaticPaginationCatchAll(context.bundle, pagePath);
  if (pagination?.kind === "archive") {
    return createArchiveMetadata(context, pagination.page);
  }
  if (pagination?.kind === "category") {
    return createCategoryMetadata(
      context,
      pagination.category,
      pagination.page,
    );
  }

  if (findGoneRoute(context.bundle, `/${pagePath.join("/")}`)) {
    return createRetiredRouteMetadata();
  }
  notFound();
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { pagePath } = await params;
  const context = getVersionedSiteReleaseContext();
  const { bundle, mediaAssets } = context;
  const page = findPageByPathSegments(bundle, pagePath);

  if (page) {
    return renderThemePage(
      bundle,
      createStaticPageThemeViewModel(
        context,
        page,
        renderStaticPageContent(context, pagePath),
      ),
    );
  }

  const pagination = resolveStaticPaginationCatchAll(bundle, pagePath);
  if (pagination?.kind === "archive") {
    const routeSource = { ...bundle, mediaAssets };
    return renderThemePage(
      bundle,
      createArchiveThemeViewModel(routeSource, pagination.page),
    );
  }
  if (pagination?.kind === "category") {
    const routeSource = { ...bundle, mediaAssets };
    return renderThemePage(
      bundle,
      createCategoryThemeViewModel(
        routeSource,
        pagination.category,
        pagination.page,
      ),
    );
  }

  const retiredRoute = findGoneRoute(bundle, `/${pagePath.join("/")}`);
  if (retiredRoute) {
    return renderThemePage(
      bundle,
      createRetiredThemeViewModel(bundle, retiredRoute),
    );
  }
  notFound();
}
