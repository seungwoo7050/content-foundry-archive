import type { ArchiveRouteViewModel } from "@content-foundry/themes";

import {
  getArchiveEntries,
  type ArchiveArticleRecord,
  type ArchiveCategoryRecord,
} from "./archive-view-model";
import {
  createThemeArticleListItem,
  type ThemeArticleListRecord,
  type ThemeArticleListSource,
} from "./theme-article-list-item";

interface ArchiveThemeArticleRecord
  extends ArchiveArticleRecord,
    ThemeArticleListRecord {}

interface ArchiveThemeCategoryRecord extends ArchiveCategoryRecord {
  readonly slug: string;
}

export interface ArchiveThemeSource extends ThemeArticleListSource {
  readonly site: ThemeArticleListSource["site"] & { readonly name: string };
  readonly articles: readonly ArchiveThemeArticleRecord[];
  readonly taxonomy: ThemeArticleListSource["taxonomy"] & {
    readonly categories: readonly ArchiveThemeCategoryRecord[];
  };
}

export function createArchiveThemeViewModel(
  bundle: ArchiveThemeSource,
): ArchiveRouteViewModel {
  const articles = getArchiveEntries(bundle).map(({ article }) =>
    createThemeArticleListItem(bundle, article),
  );

  return {
    kind: "archive",
    path: "/archive",
    heading: "전체 글",
    description: `${bundle.site.name}의 안내 글을 게시일 최신순으로 모았습니다.`,
    breadcrumbs: [
      { href: "/", label: bundle.site.name },
      { href: "/archive", label: "전체 글" },
    ],
    articles,
  };
}
