import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  ArticleListItemViewModel,
  CategoryLinkViewModel,
  DateViewModel,
  LinkViewModel,
  NavigationItemViewModel,
  SiteShellViewModel,
  TocItemViewModel,
} from "./presentation-view-model.js";

describe("shared presentation facts", () => {
  it("expresses shell navigation without producer identifiers", () => {
    const navigation: NavigationItemViewModel = {
      link: { href: "/archive", label: "전체 글" },
      children: [],
    };
    const shell: SiteShellViewModel = {
      locale: "ko-KR",
      skipLink: { href: "#main-content", label: "본문으로 바로가기" },
      brand: { href: "/", label: "생활메모" },
      description: "실생활 정보를 정리합니다.",
      primaryNavigation: [navigation],
      footerText: "© 2026 생활메모",
    };

    expect(shell.primaryNavigation).toEqual([navigation]);
    expectTypeOf(shell).not.toHaveProperty("bundle");
    expectTypeOf(navigation).not.toHaveProperty("id");
  });

  it("keeps list entries limited to rendered public facts", () => {
    expectTypeOf<ArticleListItemViewModel["link"]>().toEqualTypeOf<LinkViewModel>();
    expectTypeOf<ArticleListItemViewModel["summary"]>().toEqualTypeOf<string>();
    expectTypeOf<ArticleListItemViewModel["date"]>().toEqualTypeOf<DateViewModel>();
    expectTypeOf<ArticleListItemViewModel["category"]>().toEqualTypeOf<
      LinkViewModel | null
    >();
    expectTypeOf<ArticleListItemViewModel["topics"]>().toEqualTypeOf<
      readonly string[]
    >();
  });

  it("retains category scope and table-of-contents hierarchy", () => {
    expectTypeOf<CategoryLinkViewModel>().toExtend<LinkViewModel>();
    expectTypeOf<CategoryLinkViewModel["description"]>().toEqualTypeOf<string>();
    expectTypeOf<TocItemViewModel>().toEqualTypeOf<{
      readonly id: string;
      readonly label: string;
      readonly level: number;
    }>();
  });
});
