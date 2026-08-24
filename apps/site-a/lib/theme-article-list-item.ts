import { ContractError, type ContractIssue } from "@content-foundry/content-contract";
import type { ArticleListItemViewModel } from "@content-foundry/themes";

import { getArticleCardDate } from "./article-card-date";
import {
  getEstimatedReadingTimeMinutes,
  type ArticleReadingTimeSource,
} from "./article-reading-time";

interface ThemeArticleTaxonRecord {
  readonly id: string;
  readonly slug: string;
  readonly label: string;
}

export interface ThemeArticleListSource {
  readonly site: { readonly locale: string; readonly timeZone: string };
  readonly taxonomy: {
    readonly categories: readonly ThemeArticleTaxonRecord[];
    readonly tags: readonly ThemeArticleTaxonRecord[];
  };
}

export interface ThemeArticleListRecord extends ArticleReadingTimeSource {
  readonly title: string;
  readonly summary: string;
  readonly publishedAt: string;
  readonly updatedAt: string;
  readonly categoryId: string;
  readonly tagIds: readonly string[];
  readonly seo: { readonly canonicalPath: string };
}

export function createThemeArticleListItem(
  bundle: ThemeArticleListSource,
  article: ThemeArticleListRecord,
  dateStrategy: "latest" | "published" = "latest",
): ArticleListItemViewModel {
  const issues: ContractIssue[] = [];
  const category = bundle.taxonomy.categories.find(
    ({ id }) => id === article.categoryId,
  );
  if (!category) {
    issues.push({
      path: "/article/categoryId",
      message: `unknown theme article category: ${article.categoryId}`,
    });
  }
  const topics = article.tagIds.flatMap((tagId, index) => {
    const tag = bundle.taxonomy.tags.find(({ id }) => id === tagId);
    if (tag) return [tag.label];
    issues.push({
      path: `/article/tagIds/${index}`,
      message: `unknown theme article tag: ${tagId}`,
    });
    return [];
  });
  if (!category || issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Theme article list item references missing taxonomy",
      issues,
    );
  }

  const displayDate = getArticleCardDate(article, dateStrategy);
  const dateLabel = new Intl.DateTimeFormat(bundle.site.locale, {
    dateStyle: "long",
    timeZone: bundle.site.timeZone,
  }).format(new Date(displayDate.dateTime));
  const estimatedReadingTimeMinutes = getEstimatedReadingTimeMinutes(
    article,
    bundle.site.locale,
  );

  return {
    link: { href: article.seo.canonicalPath, label: article.title },
    summary: article.summary,
    date: {
      kind: displayDate.kind,
      dateTime: displayDate.dateTime,
      label: dateLabel,
    },
    estimatedReadingTime: {
      minutes: estimatedReadingTimeMinutes,
      label: `예상 읽기 시간 약 ${estimatedReadingTimeMinutes}분`,
    },
    category: { href: `/category/${category.slug}`, label: category.label },
    topics,
  };
}
