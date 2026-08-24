import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createCategoryMetadata } from "../../../../../lib/category-metadata";
import {
  getCategoryAdditionalPageStaticParams,
  resolveCategoryAdditionalPage,
} from "../../../../../lib/category-route";
import { createCategoryThemeViewModel } from "../../../../../lib/category-theme-view-model";
import { getVersionedSiteReleaseContext } from "../../../../../lib/site-release";
import { renderThemePage } from "../../../../../lib/theme-page";

export const dynamicParams = false;

interface CategoryAdditionalPageProps {
  readonly params: Promise<{
    readonly category: string;
    readonly page: string;
  }>;
}

export function generateStaticParams() {
  return getCategoryAdditionalPageStaticParams(
    getVersionedSiteReleaseContext().bundle,
  );
}

export async function generateMetadata({
  params,
}: CategoryAdditionalPageProps): Promise<Metadata> {
  const { category: slug, page: value } = await params;
  const context = getVersionedSiteReleaseContext();
  const result = resolveCategoryAdditionalPage(context.bundle, slug, value);
  if (result === null) notFound();
  return createCategoryMetadata(context, result.category, result.page);
}

export default async function CategoryAdditionalPage({
  params,
}: CategoryAdditionalPageProps) {
  const { category: slug, page: value } = await params;
  const { bundle } = getVersionedSiteReleaseContext();
  const result = resolveCategoryAdditionalPage(bundle, slug, value);
  if (result === null) notFound();
  return renderThemePage(
    bundle,
    createCategoryThemeViewModel(bundle, result.category, result.page),
  );
}
