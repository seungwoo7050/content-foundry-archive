import { ContractError, type ContractIssue } from "@content-foundry/content-contract";
import type { ArticleListItemViewModel } from "@content-foundry/themes";

import {
  createThemeArticleListItem,
  type ThemeArticleListRecord,
  type ThemeArticleListSource,
} from "./theme-article-list-item";

interface RelatedThemeArticleRecord extends ThemeArticleListRecord {
  readonly id: string;
}

export interface RelatedThemeArticleSource extends ThemeArticleListSource {
  readonly articles: readonly RelatedThemeArticleRecord[];
}

export interface RelatedThemeArticleOwner {
  readonly relatedArticleIds: readonly string[];
}

export function createRelatedThemeArticleItems(
  bundle: RelatedThemeArticleSource,
  article: RelatedThemeArticleOwner,
): readonly ArticleListItemViewModel[] {
  const byId = new Map(bundle.articles.map((candidate) => [candidate.id, candidate]));
  const issues: ContractIssue[] = [];
  const items = article.relatedArticleIds.flatMap((articleId, index) => {
    const related = byId.get(articleId);
    if (related) return [createThemeArticleListItem(bundle, related)];
    issues.push({
      path: `/article/relatedArticleIds/${index}`,
      message: `unknown related theme article: ${articleId}`,
    });
    return [];
  });

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Theme article references missing related articles",
      issues,
    );
  }
  return items;
}
