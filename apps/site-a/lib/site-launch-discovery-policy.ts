import type { ReleaseMode } from "@content-foundry/site-core";

import { hasMeaningfulPublicContent } from "./meaningful-public-content";
import { SiteLaunchReadinessError } from "./site-launch-readiness-error";

export const SITE_A_LAUNCH_CATEGORIES = Object.freeze([
  { id: "daily-admin", slug: "daily-admin", label: "생활·행정" },
  { id: "digital", slug: "digital", label: "디지털" },
  { id: "broadcast-events", slug: "broadcast-events", label: "방송·이벤트" },
  { id: "consumer", slug: "consumer", label: "소비" },
  { id: "timely", slug: "timely", label: "시의성" },
] as const);
export const SITE_A_PRIMARY_NAVIGATION_PATHS = Object.freeze([
  "/",
  ...SITE_A_LAUNCH_CATEGORIES.map(({ slug }) => `/category/${slug}`),
  "/search",
  "/about",
] as const);

interface LaunchCategory {
  readonly id: string;
  readonly slug: string;
  readonly label: string;
}

interface NavigationRecord extends Omit<LaunchCategory, "slug"> {
  readonly path: string;
  readonly children: readonly NavigationRecord[];
}

export interface SiteLaunchDiscoverySource {
  readonly site: { readonly search: { readonly enabled: boolean } };
  readonly taxonomy: { readonly categories: readonly LaunchCategory[] };
  readonly navigation: { readonly items: readonly NavigationRecord[] };
  readonly articles: readonly {
    readonly id: string;
    readonly categoryId: string;
    readonly content: readonly unknown[];
  }[];
}

function categoryNavigation(items: readonly NavigationRecord[]): NavigationRecord[] {
  return items.flatMap((item) => [
    ...(/^\/category\/[^/]+$/.test(item.path) ? [item] : []),
    ...categoryNavigation(item.children),
  ]);
}

function matchesLaunchCategories(
  actual: readonly LaunchCategory[],
): boolean {
  return actual.length === SITE_A_LAUNCH_CATEGORIES.length
    && actual.every((category, index) => {
      const expected = SITE_A_LAUNCH_CATEGORIES[index];
      return category.id === expected?.id
        && category.slug === expected.slug
        && category.label === expected.label;
    });
}

export function validateSiteLaunchDiscovery(
  mode: ReleaseMode,
  source: SiteLaunchDiscoverySource,
): void {
  if (mode !== "production") return;

  const issues: string[] = [];
  if (!matchesLaunchCategories(source.taxonomy.categories)) {
    issues.push("production taxonomy must match the five Site A launch categories in charter order");
  }
  if (!source.site.search.enabled) {
    issues.push("production static search must be enabled");
  }
  const navigation = categoryNavigation(source.navigation.items);
  if (
    source.navigation.items.map(({ path }) => path).join("\n") !==
    SITE_A_PRIMARY_NAVIGATION_PATHS.join("\n")
  ) {
    issues.push(
      "production primary navigation must expose home, five categories, search, and about in charter order",
    );
  }
  if (!matchesLaunchCategories(navigation.map((item) => ({
    id: item.id,
    slug: item.path.slice("/category/".length),
    label: item.label,
  })))) {
    issues.push(
      "production navigation must identify the five Site A categories once in charter order",
    );
  }
  for (const article of source.articles) {
    if (!hasMeaningfulPublicContent(article.content)) {
      issues.push(`published article ${article.id} content is empty`);
    }
  }
  for (const category of SITE_A_LAUNCH_CATEGORIES) {
    if (!source.articles.some((article) => (
      article.categoryId === category.id
      && hasMeaningfulPublicContent(article.content)
    ))) {
      issues.push(`${category.id} category requires a non-empty published article`);
    }
  }

  if (issues.length > 0) throw new SiteLaunchReadinessError(issues);
}
