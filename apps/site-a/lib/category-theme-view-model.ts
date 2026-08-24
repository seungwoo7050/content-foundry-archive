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
): CategoryRouteViewModel {
  const articles = getCategoryArticles(bundle, category.id);
  const topics = getCategoryTags(bundle, articles).map(({ label }) => label);
  const path = `/category/${category.slug}`;

  return {
    kind: "category",
    path,
    heading: category.label,
    description: getCategoryDescription(category),
    breadcrumbs: [
      { href: "/", label: bundle.site.name },
      { href: path, label: category.label },
    ],
    articleSectionHeading: "최근 안내",
    articles: articles.map((article) =>
      createThemeArticleListItem(bundle, article),
    ),
    topicSectionHeading: topics.length > 0 ? "관련 주제" : null,
    topics,
  };
}
