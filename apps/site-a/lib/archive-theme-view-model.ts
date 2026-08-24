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
import {
  getStaticListPagePath,
  paginateStaticList,
} from "./static-list-pagination";

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
  currentPage = 1,
): ArchiveRouteViewModel {
  const basePath = "/archive";
  const page = paginateStaticList(
    getArchiveEntries(bundle),
    currentPage,
    basePath,
  );
  const articles = page.records.map(({ article }) =>
    createThemeArticleListItem(bundle, article, "published"),
  );
  const path = getStaticListPagePath(basePath, currentPage);
  const heading = currentPage === 1 ? "전체 글" : `전체 글 ${currentPage}페이지`;
  const description = `${bundle.site.name}의 안내 글을 게시일 최신순으로 모았습니다.`;

  return {
    kind: "archive",
    path,
    heading,
    description: currentPage === 1
      ? description
      : `${description} ${currentPage}페이지입니다.`,
    breadcrumbs: [
      { href: "/", label: bundle.site.name },
      { href: basePath, label: "전체 글" },
      ...(currentPage === 1
        ? []
        : [{ href: path, label: `${currentPage}페이지` }]),
    ],
    articles,
    pagination: page.pagination,
  };
}
