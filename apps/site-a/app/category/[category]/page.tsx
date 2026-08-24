import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryListing } from "../../../components/category-listing";
import { RetiredRoute } from "../../../components/retired-route";
import {
  getCategoryArticles,
  getCategoryTags,
} from "../../../lib/category-articles";
import { createCategoryMetadata } from "../../../lib/category-metadata";
import {
  findCategoryBySlug,
  getCategoryPageStaticParams,
} from "../../../lib/category-route";
import { findGoneRoute } from "../../../lib/gone-route";
import { createRetiredRouteMetadata } from "../../../lib/retired-route-metadata";
import { getVersionedSiteReleaseContext } from "../../../lib/site-release";

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
  const { bundle } = getVersionedSiteReleaseContext();
  const category = findCategoryBySlug(bundle, slug);

  if (!category) {
    const retiredRoute = findGoneRoute(bundle, `/category/${slug}`);
    if (retiredRoute) {
      return (
        <RetiredRoute
          path={retiredRoute.path}
          replacementPath={retiredRoute.replacementPath}
        />
      );
    }
    notFound();
  }

  const articles = getCategoryArticles(bundle, category.id);
  const tags = getCategoryTags(bundle, articles);

  return (
    <CategoryListing
      articles={articles}
      category={category}
      locale={bundle.site.locale}
      tags={tags}
      timeZone={bundle.site.timeZone}
    />
  );
}
