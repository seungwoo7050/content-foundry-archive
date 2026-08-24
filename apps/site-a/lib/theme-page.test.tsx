import { resolve } from "node:path";
import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  loadReleaseBundle,
  type LoadedReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import {
  SKIN_IDS,
  SKIN_TOKENS,
  THEME_IDS,
  type HomeRouteViewModel,
  type ThemeId,
  type ThemePageViewModel,
} from "@content-foundry/themes";
import { describe, expect, expectTypeOf, it } from "vitest";

import { createThemeShellViewModel } from "./theme-shell-view-model";
import { renderThemePage, type ThemePageSource } from "./theme-page";

const bundle = loadReleaseBundle(resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
));
const route: HomeRouteViewModel = {
  kind: "home", path: "/", heading: "생활메모",
  description: "도움이 되는 안내",
  breadcrumbs: [{ href: "/", label: "생활메모" }],
  articleSectionHeading: "최근 안내", articles: [], categories: [], searchLink: null,
};

function withDefaults(
  defaultTheme: ThemeId = "minimal-knowledge-base",
  defaultSkin = "calm-blue",
): ThemePageSource {
  return { ...bundle, site: { ...bundle.site, defaultTheme, defaultSkin } };
}

function withUnsafeDefault(value: Record<string, string>): ThemePageSource {
  return { ...bundle, site: { ...bundle.site, ...value } } as unknown as ThemePageSource;
}

describe("renderThemePage", () => {
  it("accepts both supported bundle structures", () => {
    expectTypeOf<LoadedReleaseBundle>().toExtend<ThemePageSource>();
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<ThemePageSource>();
    expectTypeOf<ReturnType<typeof renderThemePage>>().toEqualTypeOf<ReactNode>();
  });

  it.each(THEME_IDS)("selects the exact %s module", (themeId) => {
    const html = renderToStaticMarkup(renderThemePage(withDefaults(themeId), route));
    expect(html).toContain(`data-theme="${themeId}"`);
  });

  it.each(THEME_IDS)(
    "renders projected footer trust links in %s",
    (themeId) => {
      const html = renderToStaticMarkup(
        renderThemePage(withDefaults(themeId), route),
      );

      expect(html).toContain('<nav aria-label="운영 및 정책">');
      expect(html).toContain('<a href="/about">소개</a>');
    },
  );

  it.each(SKIN_IDS)("binds the %s semantic token context", (skinId) => {
    const html = renderToStaticMarkup(
      renderThemePage(withDefaults("minimal-knowledge-base", skinId), route),
    );
    expect(html).toContain(`data-skin="${skinId}"`);
    for (const color of Object.values(SKIN_TOKENS[skinId])) {
      expect(html).toContain(color);
    }
  });

  it("passes provider-neutral nodes to the selected theme", () => {
    const html = renderToStaticMarkup(renderThemePage(
      withDefaults("friendly-mobile-utility"),
      route,
      { "home-feed": <aside data-test-slot="home-feed">광고 슬롯</aside> },
    ));

    expect(html).toContain('data-test-slot="home-feed"');
  });

  it("passes only the projected shell and route to the renderer", () => {
    const element = renderThemePage(
      withDefaults("clean-personal-blog"), route,
    ) as ReactElement<{ model: ThemePageViewModel }>;

    expect(element.props.model).toEqual({
      shell: createThemeShellViewModel(bundle),
      route,
    });
    expect(Object.keys(element.props.model)).toEqual(["shell", "route"]);
    expect(element.props.model).not.toHaveProperty("release");
  });

  it("fails closed for unknown theme and skin values", () => {
    expect(() => renderThemePage(
      withUnsafeDefault({ defaultTheme: "unknown-theme" }), route,
    )).toThrow("Unknown theme: unknown-theme");
    expect(() => renderThemePage(
      withUnsafeDefault({ defaultSkin: "unknown-skin" }), route,
    )).toThrow("Unknown theme skin: unknown-skin");
  });
});
