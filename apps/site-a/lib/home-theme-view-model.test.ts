import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import type { HomeRouteViewModel } from "@content-foundry/themes";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createHomeThemeViewModel,
  type HomeThemeSource,
} from "./home-theme-view-model";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("home theme view model", () => {
  it("accepts v3 and returns the closed home route contract", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<HomeThemeSource>();
    expectTypeOf<ReturnType<typeof createHomeThemeViewModel>>().toEqualTypeOf<
      HomeRouteViewModel
    >();
  });

  it("projects only actual home discovery facts", () => {
    const model = createHomeThemeViewModel(bundle);

    expect(model).toMatchObject({
      kind: "home",
      path: "/",
      heading: "생활메모",
      description: "실생활에 도움이 되는 정보를 정리하는 1인 운영 블로그",
      breadcrumbs: [{ href: "/", label: "생활메모" }],
      articleSectionHeading: "최근 안내",
      categories: [
        { href: "/category/daily-admin", label: "생활·행정" },
      ],
      searchLink: { href: "/search", label: "사이트 검색" },
    });
    expect(model.articles[0]).toMatchObject({
      link: {
        href: "/article/government24-resident-registration-guide",
        label: "정부24 주민등록등본 발급 방법",
      },
      topics: ["정부24"],
    });
    expect(model).not.toHaveProperty("popularArticles");
    expect(model).not.toHaveProperty("trendingArticles");
  });

  it("sorts by material update and omits a disabled search action", () => {
    const first = bundle.articles[0]!;
    const model = createHomeThemeViewModel({
      ...bundle,
      site: { ...bundle.site, search: { enabled: false } },
      articles: [
        first,
        {
          ...first,
          id: "ART-000999",
          title: "더 최근 안내",
          updatedAt: "2026-08-24T00:00:00Z",
          seo: { ...first.seo, canonicalPath: "/article/newer-guide" },
        },
      ],
    });

    expect(model.articles.map(({ link }) => link.label)).toEqual([
      "더 최근 안내",
      "정부24 주민등록등본 발급 방법",
    ]);
    expect(model.searchLink).toBeNull();
  });
});
