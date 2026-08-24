import type { ReactNode } from "react";

import type { ArticleRouteViewModel } from "@content-foundry/themes";

import {
  type ArticleAdEligibilityContext,
  type ArticleAdEligibilityRecord,
  isArticleAdvertisingEligible,
} from "./article-ad-eligibility";
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
    ArticleBreadcrumbArticle,
    RelatedThemeArticleOwner,
    ArticleAdEligibilityRecord {
  readonly summary: string;
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
    authorLabel: trust.authorLabel,
    operatorLabel: trust.operatorLabel,
    published: trust.published,
    updated: trust.updated,
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
