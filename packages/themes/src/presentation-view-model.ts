import type { ReactNode } from "react";

export interface LinkViewModel {
  readonly href: string;
  readonly label: string;
}

export interface CategoryLinkViewModel extends LinkViewModel {
  readonly description: string;
}

export interface DateViewModel {
  readonly dateTime: string;
  readonly label: string;
}

export interface ArticleCardDateViewModel extends DateViewModel {
  readonly kind: "published" | "updated";
}

export interface EstimatedReadingTimeViewModel {
  readonly minutes: number;
  readonly label: string;
}

export interface PaginationViewModel {
  readonly currentPage: number;
  readonly pageCount: number;
  readonly previous: LinkViewModel | null;
  readonly next: LinkViewModel | null;
}

export interface NavigationItemViewModel {
  readonly link: LinkViewModel;
  readonly children: readonly NavigationItemViewModel[];
}

export interface SiteShellViewModel {
  readonly locale: string;
  readonly skipLink: LinkViewModel;
  readonly brand: LinkViewModel;
  readonly description: string;
  readonly searchLink?: LinkViewModel | null;
  readonly primaryNavigation: readonly NavigationItemViewModel[];
  readonly footerNavigation?: readonly LinkViewModel[];
  readonly footerText: string;
}

export interface ArticleListItemViewModel {
  readonly artwork?: ReactNode | null;
  readonly link: LinkViewModel;
  readonly summary: string;
  readonly date: ArticleCardDateViewModel;
  readonly estimatedReadingTime: EstimatedReadingTimeViewModel;
  readonly category: LinkViewModel | null;
  readonly topics: readonly string[];
}

export interface ArticleSourceViewModel {
  readonly label: string;
  readonly href: string | null;
}

export interface FaqItemViewModel {
  readonly question: string;
  readonly answer: string;
}

export interface TocItemViewModel {
  readonly id: string;
  readonly label: string;
  readonly level: number;
}
