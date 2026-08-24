import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import type { SiteShellViewModel } from "@content-foundry/themes";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createThemeShellViewModel,
  type ThemeShellSource,
} from "./theme-shell-view-model";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("theme shell view model", () => {
  it("accepts both supported release structures", () => {
    expectTypeOf<LoadedReleaseBundle>().toExtend<ThemeShellSource>();
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<ThemeShellSource>();
    expectTypeOf<ReturnType<typeof createThemeShellViewModel>>().toEqualTypeOf<
      SiteShellViewModel
    >();
  });

  it("projects the exact public shell facts from the v2 fixture", () => {
    const shell = createThemeShellViewModel(bundle);

    expect(shell).toEqual({
      locale: "ko-KR",
      skipLink: { href: "#main-content", label: "본문으로 바로가기" },
      brand: { href: "/", label: "생활메모" },
      description: "실생활에 도움이 되는 정보를 정리하는 1인 운영 블로그",
      searchLink: { href: "/search", label: "검색" },
      primaryNavigation: [
        { link: { href: "/", label: "홈" }, children: [] },
        {
          link: { href: "/category/daily-admin", label: "생활·행정" },
          children: [],
        },
      ],
      footerNavigation: [{ href: "/about", label: "소개" }],
      footerText: "© 2026 생활메모 · 운영: 생활메모",
    });
    expect(shell).not.toHaveProperty("bundle");
    expect(shell).not.toHaveProperty("contractVersion");
    expect(shell.primaryNavigation[0]).not.toHaveProperty("id");
  });

  it("omits the search entry point when the release disables search", () => {
    const shell = createThemeShellViewModel({
      ...bundle,
      site: { ...bundle.site, search: { enabled: false } },
    });

    expect(shell.searchLink).toBeNull();
  });

  it("recursively projects navigation and uses the release year", () => {
    const navigation: LoadedReleaseBundle["navigation"] = {
      items: [
        {
          id: "guides",
          label: "안내",
          path: "/guides",
          children: [
            {
              id: "nested",
              label: "세부 안내",
              path: "/guides/nested",
              children: [],
            },
          ],
        },
      ],
    };
    const shell = createThemeShellViewModel({
      ...bundle,
      release: { ...bundle.release, createdAt: "2031-12-31T23:59:59Z" },
      navigation,
    });

    expect(shell.primaryNavigation).toEqual([
      {
        link: { href: "/guides", label: "안내" },
        children: [
          {
            link: { href: "/guides/nested", label: "세부 안내" },
            children: [],
          },
        ],
      },
    ]);
    expect(shell.footerText).toBe("© 2031 생활메모 · 운영: 생활메모");
  });

  it("projects available trust pages in fixed policy order", () => {
    const pages = [
      { ...bundle.pages[0]!, path: "/privacy", title: "개인정보" },
      { ...bundle.pages[0]!, path: "/contact", title: "문의" },
      { ...bundle.pages[0]!, path: "/advertising-disclosure", title: "광고 안내" },
      bundle.pages[0]!,
      { ...bundle.pages[0]!, path: "/unlisted", title: "기타" },
    ];

    expect(createThemeShellViewModel({ ...bundle, pages }).footerNavigation)
      .toEqual([
        { href: "/about", label: "소개" },
        { href: "/contact", label: "문의" },
        { href: "/privacy", label: "개인정보" },
        { href: "/advertising-disclosure", label: "광고 안내" },
      ]);
  });
});
