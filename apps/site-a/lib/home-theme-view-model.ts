import type { HomeRouteViewModel } from "@content-foundry/themes";

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

export interface HomeThemeSource {
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
  const aboutPage = bundle.pages.find(({ path }) => path === "/about");
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
