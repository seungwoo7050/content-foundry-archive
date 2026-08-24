import type { CategoryRouteViewModel } from "@content-foundry/themes";

import {
  getCategoryArticles,
  getCategoryTags,
} from "./category-articles";
import {
  getCategoryDescription,
  type CategoryMetadataSource,
} from "./category-metadata";
import {
  createThemeArticleListItem,
  type ThemeArticleListRecord,
  type ThemeArticleListSource,
} from "./theme-article-list-item";
import {
  getStaticListPagePath,
  paginateStaticList,
} from "./static-list-pagination";

interface CategoryThemeArticleRecord extends ThemeArticleListRecord {
  readonly id: string;
}

export interface CategoryThemeSource extends ThemeArticleListSource {
  readonly site: ThemeArticleListSource["site"] & { readonly name: string };
  readonly articles: readonly CategoryThemeArticleRecord[];
}

export function createCategoryThemeViewModel(
  bundle: CategoryThemeSource,
  category: CategoryMetadataSource & { readonly id: string },
  currentPage = 1,
): CategoryRouteViewModel {
  const articles = getCategoryArticles(bundle, category.id);
  const topics = getCategoryTags(bundle, articles).map(({ label }) => label);
  const basePath = `/category/${category.slug}`;
  const page = paginateStaticList(articles, currentPage, basePath);
  const path = getStaticListPagePath(basePath, currentPage);
  const heading = currentPage === 1
    ? category.label
    : `${category.label} ${currentPage}페이지`;
  const description = getCategoryDescription(category);

  return {
    kind: "category",
    path,
    heading,
    description: currentPage === 1
      ? description
      : `${description} ${currentPage}페이지입니다.`,
    breadcrumbs: [
      { href: "/", label: bundle.site.name },
      { href: basePath, label: category.label },
      ...(currentPage === 1
        ? []
        : [{ href: path, label: `${currentPage}페이지` }]),
    ],
    articleSectionHeading: "최근 안내",
    articles: page.records.map((article) =>
      createThemeArticleListItem(bundle, article),
    ),
    pagination: page.pagination,
    topicSectionHeading: topics.length > 0 ? "관련 주제" : null,
    topics,
  };
}
