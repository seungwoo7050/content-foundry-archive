import type { HomeRouteViewModel } from "@content-foundry/themes";

import {
  createThemeArticleListItem,
  type ThemeArticleListRecord,
  type ThemeArticleListSource,
} from "./theme-article-list-item";

interface HomeThemeArticleRecord extends ThemeArticleListRecord {
  readonly id: string;
}

export interface HomeThemeSource extends ThemeArticleListSource {
  readonly site: ThemeArticleListSource["site"] & {
    readonly name: string;
    readonly description: string;
    readonly search: { readonly enabled: boolean };
  };
  readonly articles: readonly HomeThemeArticleRecord[];
}

function compareRecentArticles(
  left: HomeThemeArticleRecord,
  right: HomeThemeArticleRecord,
) {
  const updatedDifference = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  if (updatedDifference !== 0) return updatedDifference;
  const idDifference = left.id.localeCompare(right.id);
  if (idDifference !== 0) return idDifference;
  return left.seo.canonicalPath.localeCompare(right.seo.canonicalPath);
}

export function createHomeThemeViewModel(
  bundle: HomeThemeSource,
): HomeRouteViewModel {
  return {
    kind: "home",
    path: "/",
    heading: bundle.site.name,
    description: bundle.site.description,
    breadcrumbs: [{ href: "/", label: bundle.site.name }],
    articleSectionHeading: "최근 안내",
    articles: [...bundle.articles]
      .sort(compareRecentArticles)
      .map((article) => createThemeArticleListItem(bundle, article)),
    categories: bundle.taxonomy.categories.map(({ slug, label }) => ({
      href: `/category/${slug}`,
      label,
    })),
    searchLink: bundle.site.search.enabled
      ? { href: "/search", label: "사이트 검색" }
      : null,
  };
}
