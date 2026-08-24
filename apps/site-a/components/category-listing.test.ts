import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CategoryListing } from "./category-listing";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("CategoryListing", () => {
  it("composes a labelled category with its complete article cards", () => {
    const category = bundle.taxonomy.categories[0];
    const article = bundle.articles[0];
    if (!category || !article) {
      throw new Error("Site A fixture category data is incomplete");
    }
    const html = renderToStaticMarkup(
      createElement(CategoryListing, {
        category: { ...category, description: " " },
        articles: [article],
        locale: bundle.site.locale,
        timeZone: bundle.site.timeZone,
      }),
    );

    expect(html).toContain(
      '<div class="category-page"><header><h1>생활·행정</h1><p>생활·행정 카테고리의 안내 글을 모았습니다.</p></header>',
    );
    expect(html).toContain(
      '<section aria-labelledby="category-recent"><h2 id="category-recent">최근 안내</h2><ul class="article-list"><li><article>',
    );
    expect(html).toContain(
      '<a href="/article/government24-resident-registration-guide">정부24 주민등록등본 발급 방법</a>',
    );
    expect(html).toContain(
      "<p>정부24에서 주민등록등본을 발급하는 기본 절차를 정리합니다.</p>",
    );
  });
});
