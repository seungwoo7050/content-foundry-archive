import type { ReactNode } from "react";

import { ContractError, type ContractIssue } from "@content-foundry/content-contract";
import type { ArticleRouteViewModel } from "@content-foundry/themes";

import {
  type ArticleAdEligibilityContext,
  type ArticleAdEligibilityRecord,
  isArticleAdvertisingEligible,
} from "./article-ad-eligibility";
import {
  getEstimatedReadingTimeMinutes,
  type ArticleReadingTimeSource,
} from "./article-reading-time";
import {
  createArticleBreadcrumbs,
  type ArticleBreadcrumbArticle,
  type ArticleBreadcrumbCategory,
} from "./article-breadcrumbs";
import {
  createArticleTrustViewModel,
  type ArticleTrustRecord,
  type ArticleTrustSource,
} from "./article-trust-view-model";
import {
  createRelatedThemeArticleItems,
  type RelatedThemeArticleOwner,
  type RelatedThemeArticleSource,
} from "./theme-related-articles";

export interface ArticleThemeContext {
  readonly config: ArticleAdEligibilityContext["config"];
  readonly bundle: ArticleTrustSource &
    RelatedThemeArticleSource & {
      readonly site: ArticleTrustSource["site"] &
        ArticleAdEligibilityContext["site"] & { readonly name: string };
    };
}

export interface ArticleThemeRecord
  extends ArticleTrustRecord,
    ArticleReadingTimeSource,
    ArticleBreadcrumbArticle,
    RelatedThemeArticleOwner,
    ArticleAdEligibilityRecord {
  readonly summary: string;
  readonly tagIds: readonly string[];
  readonly toc: readonly {
    readonly id: string;
    readonly text: string;
    readonly level: number;
  }[];
}

export interface ArticleThemeSlots {
  readonly readerActions?: ReactNode | null;
  readonly hero: ReactNode;
  readonly body: ReactNode;
}

function createTrustLinks(
  trust: ReturnType<typeof createArticleTrustViewModel>,
): ArticleRouteViewModel["trustLinks"] {
  return [
    ...(trust.aboutPath
      ? [{ href: trust.aboutPath, label: "운영 방식 보기" }]
      : []),
    ...(trust.contactPath
      ? [{ href: trust.contactPath, label: "수정 요청하기" }]
      : []),
  ];
}

function createTopicLabels(
  bundle: ArticleThemeContext["bundle"],
  tagIds: readonly string[],
): readonly string[] {
  const issues: ContractIssue[] = [];
  const topics = tagIds.flatMap((tagId, index) => {
    const tag = bundle.taxonomy.tags.find(({ id }) => id === tagId);
    if (tag) return [tag.label];
    issues.push({
      path: `/article/tagIds/${index}`,
      message: `unknown article topic tag: ${tagId}`,
    });
    return [];
  });
  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Article topics reference missing taxonomy",
      issues,
    );
  }
  return topics;
}

export function createArticleThemeViewModel(
  context: ArticleThemeContext,
  article: ArticleThemeRecord,
  category: ArticleBreadcrumbCategory,
  slots: ArticleThemeSlots,
): ArticleRouteViewModel {
  const trust = createArticleTrustViewModel(context.bundle, article);
  const relatedArticles = createRelatedThemeArticleItems(
    context.bundle,
    article,
  );
  const estimatedReadingTimeMinutes = getEstimatedReadingTimeMinutes(
    article,
    context.bundle.site.locale,
  );

  return {
    kind: "article",
    path: article.seo.canonicalPath,
    heading: article.title,
    description: article.summary,
    breadcrumbs: createArticleBreadcrumbs(
      context.bundle.site,
      category,
      article,
    ).map(({ label, path }) => ({ href: path, label })),
    category: {
      href: `/category/${category.slug}`,
      label: category.label,
    },
    topics: createTopicLabels(context.bundle, article.tagIds),
    authorLabel: trust.authorLabel,
    operatorLabel: trust.operatorLabel,
    published: trust.published,
    updated: trust.updated,
    estimatedReadingTime: {
      minutes: estimatedReadingTimeMinutes,
      label: `예상 읽기 시간 약 ${estimatedReadingTimeMinutes}분`,
    },
    trustLinks: createTrustLinks(trust),
    toc: article.toc.map(({ id, text, level }) => ({ id, label: text, level })),
    sources: trust.sources,
    updateTriggers: trust.updateTriggers,
    faq: trust.faq.map(({ question, answerText }) => ({
      question,
      answer: answerText,
    })),
    relatedSectionHeading: relatedArticles.length > 0 ? "관련 안내" : null,
    relatedArticles,
    advertisingEligible: isArticleAdvertisingEligible(
      { config: context.config, site: context.bundle.site },
      article,
    ),
    readerActions: slots.readerActions ?? null,
    hero: slots.hero,
    body: slots.body,
  };
}
