import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  loadReleaseBundle,
  loadV3ReleaseBundle,
  type LoadedReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import type { StaticPageRouteViewModel } from "@content-foundry/themes";
import { describe, expect, expectTypeOf, it } from "vitest";

import { VersionedContentBlocks } from "../components/versioned-content-blocks";
import { getGeneratedRoutes } from "./generated-routes";
import type {
  SiteReleaseContext,
  SiteReleaseContextV3,
} from "./load-site-release";
import {
  createStaticPageThemeViewModel,
  type StaticPageThemeContext,
  type StaticPageThemeRecord,
} from "./static-page-theme-view-model";

const fixtureRoot = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor",
);
const bundle = loadReleaseBundle(
  resolve(fixtureRoot, "2.0.0/fixtures/bundles/valid/site-a-minimal"),
);
const v3Bundle = loadV3ReleaseBundle(
  resolve(fixtureRoot, "3.0.0/fixtures/bundles/valid/site-a-minimal"),
  {
    resolveConsumerContext: (candidate) => ({
      generatedRoutes: getGeneratedRoutes(candidate),
      nicheComponentRegistry: { "site-a": [] },
    }),
  },
);

function firstPage<T extends LoadedReleaseBundle | LoadedReleaseBundleV3>(
  release: T,
): T["pages"][number] {
  const page = release.pages[0];
  if (!page) throw new Error("Missing static-page fixture");
  return page;
}

describe("static-page theme view model", () => {
  it("accepts both release contexts and returns the closed theme contract", () => {
    expectTypeOf<SiteReleaseContext>().toExtend<StaticPageThemeContext>();
    expectTypeOf<SiteReleaseContextV3>().toExtend<StaticPageThemeContext>();
    expectTypeOf<LoadedReleaseBundle["pages"][number]>().toExtend<
      StaticPageThemeRecord
    >();
    expectTypeOf<LoadedReleaseBundleV3["pages"][number]>().toExtend<
      StaticPageThemeRecord
    >();
    expectTypeOf<ReturnType<typeof createStaticPageThemeViewModel>>()
      .toEqualTypeOf<StaticPageRouteViewModel>();
  });

  it("exactly projects v2 route facts and preserves its rendered body slot", () => {
    const page = firstPage(bundle);
    const body = createElement(VersionedContentBlocks, {
      contractVersion: "2.0.0",
      blocks: page.content,
    });
    const model = createStaticPageThemeViewModel({ bundle }, page, body);

    expect(model).toEqual({
      kind: "static-page",
      path: "/about",
      heading: "소개",
      description: "생활메모의 운영 목적과 정보 준비 방법을 안내합니다.",
      breadcrumbs: [
        { href: "/", label: "생활메모" },
        { href: "/about", label: "소개" },
      ],
      body,
    });
    expect(model.body).toBe(body);
    expect(renderToStaticMarkup(model.body)).toContain("1인 운영 블로그입니다.");
    expect(model).not.toHaveProperty("bundle");
    expect(model).not.toHaveProperty("contractVersion");
    expect(model).not.toHaveProperty("id");
  });

  it("preserves the v3 VersionedContentBlocks slot without exposing records", () => {
    const page = firstPage(v3Bundle);
    const body = createElement(VersionedContentBlocks, {
      contractVersion: "3.0.0",
      blocks: page.content,
      context: {
        mediaAssets: new Map(),
        nicheComponents: new Map(),
        siteId: v3Bundle.release.siteId,
      },
    });
    const model = createStaticPageThemeViewModel({ bundle: v3Bundle }, page, body);
    const html = renderToStaticMarkup(model.body);

    expect(model.body).toBe(body);
    expect(model.path).toBe("/about");
    expect(html).toContain('href="/article/government24-resident-registration-guide"');
    expect(html).toContain("정부24 주민등록등본 안내 읽기");
    expect(model).not.toHaveProperty("page");
    expect(model).not.toHaveProperty("releaseId");
  });
});
