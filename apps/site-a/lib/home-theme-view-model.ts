import type {
  ArticleListItemViewModel,
  CategoryLinkViewModel,
  HomeRouteViewModel,
} from "@content-foundry/themes";

import {
  createHomePresentationViewModel,
  type HomePresentationSource,
} from "./home-presentation-view-model";
import {
  createThemeArticleListItem,
  type ThemeArticleListRecord,
  type ThemeArticleListSource,
} from "./theme-article-list-item";

interface HomeThemeArticleRecord extends ThemeArticleListRecord {
  readonly id: string;
}

interface HomeThemeTaxonRecord {
  readonly id: string;
  readonly slug: string;
  readonly label: string;
}

export interface HomeThemeSource
  extends HomePresentationSource<HomeThemeArticleRecord> {
  readonly mediaAssets?: NonNullable<ThemeArticleListSource["mediaAssets"]>;
  readonly site: ThemeArticleListSource["site"] & {
    readonly name: string;
    readonly description: string;
    readonly search: { readonly enabled: boolean };
  };
  readonly taxonomy: {
    readonly categories: readonly (HomeThemeTaxonRecord & {
      readonly description: string;
    })[];
    readonly tags: readonly HomeThemeTaxonRecord[];
  };
  readonly pages: readonly {
    readonly path: string;
    readonly title: string;
    readonly summary: string;
  }[];
}

export interface HomeThemeViewModel extends HomeRouteViewModel {
  readonly featuredArticles: readonly ArticleListItemViewModel[];
  readonly currentArticles: readonly ArticleListItemViewModel[];
  readonly evergreenArticles: readonly ArticleListItemViewModel[];
  readonly latestArticles: readonly ArticleListItemViewModel[];
  readonly categoryHighlights: readonly {
    readonly category: CategoryLinkViewModel;
    readonly articles: readonly ArticleListItemViewModel[];
  }[];
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
): HomeThemeViewModel {
  const aboutPage = bundle.pages.find(({ path }) => path === "/about");
  const presentation = createHomePresentationViewModel(bundle);
  const projectArticles = (
    articles: readonly HomeThemeArticleRecord[],
  ) => articles.map((article) => createThemeArticleListItem(bundle, article));
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
    featuredArticles: projectArticles(presentation.featuredArticles),
    currentArticles: projectArticles(presentation.currentArticles),
    evergreenArticles: projectArticles(presentation.evergreenArticles),
    latestArticles: projectArticles(presentation.latestArticles),
    categoryHighlights: presentation.categoryHighlights.map(
      ({ categoryId, articles }) => {
        const category = bundle.taxonomy.categories.find(
          ({ id }) => id === categoryId,
        );
        if (!category) {
          throw new Error(
            `Validated presentation category is missing: ${categoryId}`,
          );
        }
        return {
          category: {
            href: `/category/${category.slug}`,
            label: category.label,
            description: category.description,
          },
          articles: projectArticles(articles),
        };
      },
    ),
    categories: bundle.taxonomy.categories.map(({ slug, label, description }) => ({
      href: `/category/${slug}`,
      label,
      description,
    })),
    searchLink: bundle.site.search.enabled
      ? { href: "/search", label: "사이트 검색" }
      : null,
    aboutTeaser: aboutPage
      ? {
          href: aboutPage.path,
          label: aboutPage.title,
          description: aboutPage.summary,
        }
      : null,
  };
}
