import type { ReleaseMode } from "@content-foundry/site-core";
import type { LinkViewModel } from "@content-foundry/themes";

import { hasMeaningfulPublicContent } from "./meaningful-public-content";
import { SiteLaunchReadinessError } from "./site-launch-readiness-error";

export const REQUIRED_SITE_A_PAGE_PATHS = Object.freeze([
  "/about",
  "/contact",
  "/privacy",
  "/advertising-disclosure",
] as const);

export interface SiteLaunchContentSource {
  readonly pages: readonly {
    readonly path: string;
    readonly content: readonly unknown[];
    readonly seo: {
      readonly index: boolean;
      readonly follow: boolean;
    };
  }[];
}

export function validateSiteLaunchContent(
  mode: ReleaseMode,
  source: SiteLaunchContentSource,
  footerNavigation: readonly LinkViewModel[],
): void {
  if (mode !== "production") return;

  const pagesByPath = new Map(source.pages.map((page) => [page.path, page]));
  const issues: string[] = [];
  for (const path of REQUIRED_SITE_A_PAGE_PATHS) {
    const page = pagesByPath.get(path);
    if (!page) {
      issues.push(`${path} page is required`);
    } else {
      if (!hasMeaningfulPublicContent(page.content)) {
        issues.push(`${path} page content is empty`);
      }
      if (page.seo.index !== true || page.seo.follow !== true) {
        issues.push(`${path} page must be indexable and followable`);
      }
    }
    if (footerNavigation.filter((link) => link.href === path).length !== 1) {
      issues.push(`${path} must appear exactly once in footer navigation`);
    }
  }

  if (issues.length > 0) throw new SiteLaunchReadinessError(issues);
}
