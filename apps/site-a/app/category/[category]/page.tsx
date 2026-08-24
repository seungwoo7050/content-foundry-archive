import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryListing } from "../../../components/category-listing";
import {
  getCategoryArticles,
  getCategoryTags,
} from "../../../lib/category-articles";
import { createCategoryMetadata } from "../../../lib/category-metadata";
import {
  findCategoryBySlug,
  getCategoryStaticParams,
} from "../../../lib/category-route";
import { getSiteReleaseContext } from "../../../lib/site-release";

export const dynamicParams = false;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return getCategoryStaticParams(getSiteReleaseContext().bundle);
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const context = getSiteReleaseContext();
  const category = findCategoryBySlug(context.bundle, slug);

  if (!category) {
    notFound();
  }

  return createCategoryMetadata(context, category);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const { bundle } = getSiteReleaseContext();
  const category = findCategoryBySlug(bundle, slug);

  if (!category) {
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
