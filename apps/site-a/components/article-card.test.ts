import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";

import { ArticleCard, type ArticleCardSource } from "./article-card";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("ArticleCard", () => {
  it("accepts the v3 article card structure", () => {
    expectTypeOf<
      LoadedReleaseBundleV3["articles"][number]
    >().toExtend<ArticleCardSource>();
  });

  it("renders an honest date and complete native article link", () => {
    const article = bundle.articles[0];
    if (!article) {
      throw new Error("Site A fixture article is missing");
    }
    const html = renderToStaticMarkup(
      createElement(ArticleCard, {
        article,
        locale: bundle.site.locale,
        timeZone: bundle.site.timeZone,
      }),
    );

    expect(html).toContain(
      '<p>게시 <time dateTime="2026-08-20T01:00:00Z">2026년 8월 20일</time></p>',
    );
    expect(html).toContain(
      '<h3><a href="/article/government24-resident-registration-guide">정부24 주민등록등본 발급 방법</a></h3>',
    );
    expect(html).toContain(
      "<p>정부24에서 주민등록등본을 발급하는 기본 절차를 정리합니다.</p>",
    );
    expect(html).not.toContain("target=");
    expect(html).not.toContain("rel=");
  });
});
