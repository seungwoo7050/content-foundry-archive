import {
  getArchiveAdditionalPageStaticParams,
  resolveArchiveAdditionalPage,
} from "./archive-page-route";
import type {
  ArchiveArticleRecord,
  ArchiveCategoryRecord,
} from "./archive-view-model";
import {
  getCategoryAdditionalPageStaticParams,
  resolveCategoryAdditionalPage,
  type CategoryRouteRecord,
} from "./category-route";

interface StaticPaginationCategory
  extends ArchiveCategoryRecord, CategoryRouteRecord {}

export interface StaticPaginationSource<
  TCategory extends StaticPaginationCategory = StaticPaginationCategory,
> {
  readonly articles: readonly ArchiveArticleRecord[];
  readonly taxonomy: { readonly categories: readonly TCategory[] };
}

export function getStaticPaginationCatchAllParams(
  bundle: StaticPaginationSource,
) {
  return [
    ...getArchiveAdditionalPageStaticParams(bundle).map(({ page }) => ({
      pagePath: ["archive", "page", page],
    })),
    ...getCategoryAdditionalPageStaticParams(bundle).map(
      ({ category, page }) => ({
        pagePath: ["category", category, "page", page],
      }),
    ),
  ];
}

export function resolveStaticPaginationCatchAll<
  TCategory extends StaticPaginationCategory,
>(bundle: StaticPaginationSource<TCategory>, pagePath: readonly string[]) {
  const [first, second, third, fourth] = pagePath;
  if (pagePath.length === 3 && first === "archive" && second === "page") {
    const page = resolveArchiveAdditionalPage(bundle, third ?? "");
    return page === null ? null : { kind: "archive" as const, page };
  }
  if (pagePath.length === 4 && first === "category" && third === "page") {
    const result = resolveCategoryAdditionalPage(
      bundle,
      second ?? "",
      fourth ?? "",
    );
    return result === null ? null : { kind: "category" as const, ...result };
  }
  return null;
}
