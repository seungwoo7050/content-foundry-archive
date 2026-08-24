import { ContractError, type ContractIssue } from "./errors.js";
import type { LoadedReleaseBundleV4 } from "./validate-v4-presentation-structure.js";

export type V4PresentationReleaseMode =
  | "qa"
  | "template"
  | "preview"
  | "production";

export interface V4PresentationReadinessContext {
  readonly releaseMode: V4PresentationReleaseMode;
  readonly siteWideNoindex: boolean;
}

export function validateV4PresentationReadiness<T extends LoadedReleaseBundleV4>(
  bundle: T,
  context: V4PresentationReadinessContext,
): T {
  const issues: ContractIssue[] = [];
  if (context.releaseMode !== "production") {
    if (!context.siteWideNoindex) {
      issues.push({
        path: "/validationContext/siteWideNoindex",
        message: `${context.releaseMode} releases must emit site-wide noindex`,
      });
    }
    for (const [group, records] of [
      ["articles", bundle.articles],
      ["pages", bundle.pages],
    ] as const) {
      records.forEach((record, index) => {
        if (record.seo.index) {
          issues.push({
            path: `/${group}/${index}/seo/index`,
            message: `${context.releaseMode} records must not be indexable`,
          });
        }
      });
    }
  } else {
    const { home, categoryHighlights, brand } = bundle.presentation;
    if (home.featuredArticleIds.length + home.currentArticleIds.length === 0) {
      issues.push({
        path: "/presentation/home",
        message: "production requires at least one featured or current article",
      });
    }
    if (home.evergreenArticleIds.length === 0) {
      issues.push({
        path: "/presentation/home/evergreenArticleIds",
        message: "production requires at least one evergreen article",
      });
    }
    const highlights = new Map(
      categoryHighlights.map(({ categoryId, articleIds }) => [categoryId, articleIds]),
    );
    for (const category of bundle.taxonomy.categories) {
      if ((highlights.get(category.id)?.length ?? 0) === 0) {
        issues.push({
          path: "/presentation/categoryHighlights",
          message: `production requires a highlight for category ${category.id}`,
        });
      }
    }
    for (const slot of ["faviconMediaId", "socialImageMediaId"] as const) {
      if (brand[slot] === null) {
        issues.push({
          path: `/presentation/brand/${slot}`,
          message: `production requires ${slot}`,
        });
      }
    }
  }

  if (issues.length > 0) {
    throw new ContractError(
      "CONTRACT_INVALID",
      `Presentation is not ready for ${context.releaseMode}`,
      issues,
    );
  }
  return bundle;
}
