import type {
  LoadedReleaseBundle,
  LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  REQUIRED_SITE_A_PAGE_PATHS,
  type SiteLaunchContentSource,
  validateSiteLaunchContent,
} from "./site-launch-content-policy";
import { SiteLaunchReadinessError } from "./site-launch-readiness-error";

const createPage = (path: string) => ({
  path,
  content: [{ type: "paragraph" }],
  seo: { index: true, follow: true },
});
const completeSource = {
  pages: REQUIRED_SITE_A_PAGE_PATHS.map(createPage),
};
const completeFooter = REQUIRED_SITE_A_PAGE_PATHS.map((href) => ({
  href,
  label: href,
}));

describe("Site A launch content policy", () => {
  it("accepts both supported release page structures", () => {
    expectTypeOf<LoadedReleaseBundle>().toExtend<SiteLaunchContentSource>();
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<SiteLaunchContentSource>();
  });

  it("accepts complete production trust pages and footer discovery", () => {
    expect(() => validateSiteLaunchContent(
      "production",
      completeSource,
      completeFooter,
    )).not.toThrow();
  });

  it.each(["template", "preview"] as const)(
    "does not apply production content policy in %s",
    (mode) => {
      expect(() => validateSiteLaunchContent(mode, { pages: [] }, []))
        .not.toThrow();
    },
  );

  it("reports every missing, empty, hidden, or undiscoverable fact", () => {
    const source = {
      pages: completeSource.pages.flatMap((page) => {
        if (page.path === "/contact") return [];
        if (page.path !== "/privacy") return [page];
        return [{ ...page, content: [], seo: { index: false, follow: true } }];
      }),
    };
    const footer = completeFooter.filter(({ href }) => href !== "/privacy");

    expect(() => validateSiteLaunchContent("production", source, footer))
      .toThrow(expect.objectContaining<Partial<SiteLaunchReadinessError>>({
        issues: [
          "/contact page is required",
          "/privacy page content is empty",
          "/privacy page must be indexable and followable",
          "/privacy must appear exactly once in footer navigation",
        ],
      }));
  });
});
