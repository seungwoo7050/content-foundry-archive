import type { ReactNode } from "react";

import type {
  ArticleListItemViewModel,
  ArticleSourceViewModel,
  DateViewModel,
  FaqItemViewModel,
  LinkViewModel,
} from "./presentation-view-model.js";
import type { RouteBaseViewModel } from "./route-base-view-model.js";

export interface HomeRouteViewModel extends RouteBaseViewModel<"home"> {
  readonly articleSectionHeading: string;
  readonly articles: readonly ArticleListItemViewModel[];
  readonly categories: readonly LinkViewModel[];
  readonly searchLink: LinkViewModel | null;
}

export interface CategoryRouteViewModel extends RouteBaseViewModel<"category"> {
  readonly articleSectionHeading: string;
  readonly articles: readonly ArticleListItemViewModel[];
  readonly topicSectionHeading: string | null;
  readonly topics: readonly string[];
}

export interface ArticleRouteViewModel extends RouteBaseViewModel<"article"> {
  readonly category: LinkViewModel | null;
  readonly authorLabel: string;
  readonly operatorLabel: string;
  readonly published: DateViewModel;
  readonly updated: DateViewModel | null;
  readonly trustLinks: readonly LinkViewModel[];
  readonly sources: readonly ArticleSourceViewModel[];
  readonly updateTriggers: readonly string[];
  readonly faq: readonly FaqItemViewModel[];
  readonly relatedSectionHeading: string | null;
  readonly relatedArticles: readonly ArticleListItemViewModel[];
  readonly hero: ReactNode;
  readonly body: ReactNode;
}

export interface StaticPageRouteViewModel
  extends RouteBaseViewModel<"static-page"> {
  readonly body: ReactNode;
}

export interface ArchiveRouteViewModel extends RouteBaseViewModel<"archive"> {
  readonly articles: readonly ArticleListItemViewModel[];
}

export type ContentRouteViewModel =
  | HomeRouteViewModel
  | CategoryRouteViewModel
  | ArticleRouteViewModel
  | StaticPageRouteViewModel
  | ArchiveRouteViewModel;
