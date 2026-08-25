import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createCategoryMetadata } from "../../../lib/category-metadata";
import {
  findCategoryBySlug,
  getCategoryPageStaticParams,
} from "../../../lib/category-route";
import { createCategoryThemeViewModel } from "../../../lib/category-theme-view-model";
import { findGoneRoute } from "../../../lib/gone-route";
import { createRetiredRouteMetadata } from "../../../lib/retired-route-metadata";
import { getVersionedSiteReleaseContext } from "../../../lib/site-release";
import { createRetiredThemeViewModel } from "../../../lib/status-theme-view-model";
import { renderThemePage } from "../../../lib/theme-page";

export const dynamicParams = false;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return getCategoryPageStaticParams(getVersionedSiteReleaseContext().bundle);
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const context = getVersionedSiteReleaseContext();
  const category = findCategoryBySlug(context.bundle, slug);

  if (!category) {
    if (findGoneRoute(context.bundle, `/category/${slug}`)) {
      return createRetiredRouteMetadata();
    }
    notFound();
  }

  return createCategoryMetadata(context, category);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const { bundle, mediaAssets } = getVersionedSiteReleaseContext();
  const category = findCategoryBySlug(bundle, slug);

  if (!category) {
    const retiredRoute = findGoneRoute(bundle, `/category/${slug}`);
    if (retiredRoute) {
      return renderThemePage(
        bundle,
        createRetiredThemeViewModel(bundle, retiredRoute),
      );
    }
    notFound();
  }

  const routeSource = { ...bundle, mediaAssets };
  return renderThemePage(
    bundle,
    createCategoryThemeViewModel(routeSource, category),
  );
}
