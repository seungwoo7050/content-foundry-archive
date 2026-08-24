import type { ReactNode } from "react";

import type {
  ArticleListItemViewModel,
  ArticleSourceViewModel,
  CategoryLinkViewModel,
  DateViewModel,
  EstimatedReadingTimeViewModel,
  FaqItemViewModel,
  LinkViewModel,
  PaginationViewModel,
  TocItemViewModel,
} from "./presentation-view-model.js";
import type { RouteBaseViewModel } from "./route-base-view-model.js";

export interface HomeAboutTeaserViewModel extends LinkViewModel {
  readonly description: string;
}

export interface HomeRouteViewModel extends RouteBaseViewModel<"home"> {
  readonly articleSectionHeading: string;
  readonly articles: readonly ArticleListItemViewModel[];
  readonly featuredArticles?: readonly ArticleListItemViewModel[];
  readonly currentArticles?: readonly ArticleListItemViewModel[];
  readonly evergreenArticles?: readonly ArticleListItemViewModel[];
  readonly latestArticles?: readonly ArticleListItemViewModel[];
  readonly categoryHighlights?: readonly {
    readonly category: CategoryLinkViewModel;
    readonly articles: readonly ArticleListItemViewModel[];
  }[];
  readonly categories: readonly CategoryLinkViewModel[];
  readonly searchLink: LinkViewModel | null;
  readonly aboutTeaser?: HomeAboutTeaserViewModel | null;
}

export interface CategoryRouteViewModel extends RouteBaseViewModel<"category"> {
  readonly articleSectionHeading: string;
  readonly articles: readonly ArticleListItemViewModel[];
  readonly pagination: PaginationViewModel;
  readonly topicSectionHeading: string | null;
  readonly topics: readonly string[];
}

export interface ArticleRouteViewModel extends RouteBaseViewModel<"article"> {
  readonly category: LinkViewModel | null;
  readonly topics?: readonly string[];
  readonly authorLabel: string;
  readonly operatorLabel: string;
  readonly published: DateViewModel;
  readonly updated: DateViewModel | null;
  readonly estimatedReadingTime: EstimatedReadingTimeViewModel | undefined;
  readonly trustLinks: readonly LinkViewModel[];
  readonly toc: readonly TocItemViewModel[];
  readonly sources: readonly ArticleSourceViewModel[];
  readonly updateTriggers: readonly string[];
  readonly faq: readonly FaqItemViewModel[];
  readonly relatedSectionHeading: string | null;
  readonly relatedArticles: readonly ArticleListItemViewModel[];
  readonly advertisingEligible: boolean;
  readonly readerActions?: ReactNode | null;
  readonly hero: ReactNode;
  readonly body: ReactNode;
}

export interface StaticPageRouteViewModel
  extends RouteBaseViewModel<"static-page"> {
  readonly body: ReactNode;
}

export interface ArchiveRouteViewModel extends RouteBaseViewModel<"archive"> {
  readonly articles: readonly ArticleListItemViewModel[];
  readonly pagination: PaginationViewModel;
}

export type ContentRouteViewModel =
  | HomeRouteViewModel
  | CategoryRouteViewModel
  | ArticleRouteViewModel
  | StaticPageRouteViewModel
  | ArchiveRouteViewModel;
