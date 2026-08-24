import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ArticleRouteViewModel } from "../content-route-view-model.js";
import { InformationPortalArticle } from "./article.js";

const related = {
  link: { href: "/article/next", label: "다음 안내" },
  summary: "연관 절차",
  date: { kind: "published", dateTime: "2026-08-24T00:00:00Z", label: "2026년 8월 24일" },
  category: null,
  topics: [],
} as const;
const route: ArticleRouteViewModel = {
  kind: "article", path: "/article/start", heading: "신청 안내", description: "신청 핵심 절차",
  breadcrumbs: [{ href: "/article/start", label: "신청 안내" }],
  category: { href: "/category/life", label: "생활" }, topics: ["신청", "생활 행정"], authorLabel: "작성자", operatorLabel: "운영자",
  published: { dateTime: "2026-08-20T00:00:00Z", label: "2026년 8월 20일" },
  updated: { dateTime: "2026-08-24T00:00:00Z", label: "2026년 8월 24일" },
  trustLinks: [{ href: "/about", label: "운영 방식" }],
  toc: [{ id: "step", label: "신청 단계", level: 2 }],
  sources: [{ label: "공식 안내", href: "https://official.example/guide" }],
  updateTriggers: ["공식 절차 변경"], faq: [{ question: "준비물은?", answer: "신분증입니다." }],
  relatedSectionHeading: "관련 안내", relatedArticles: [related], advertisingEligible: true,
  readerActions: <button type="button">현재 기사 저장</button>,
  hero: <figure>대표 이미지</figure>, body: <section id="step">신청 본문</section>,
};

describe("Information Portal article", () => {
  it("places primary content before the trust rail and preserves evidence", () => {
    const html = renderToStaticMarkup(
      <InformationPortalArticle
        context={{ adSlots: { "article-end": <aside data-slot="article-end" /> } }}
        route={route}
      />,
    );

    expect(html).toContain("신청 핵심 절차");
    expect(html).toContain(
      '<ul aria-label="관련 주제" class="theme-article-topics"><li>신청</li><li>생활 행정</li></ul>',
    );
    expect(html).not.toMatch(/href="\/tag\//);
    expect(html.indexOf("신청 본문")).toBeLessThan(html.indexOf("글 탐색과 안내 정보"));
    expect(html).toContain('href="#step">신청 단계</a>');
    expect(html).toContain("2026년 8월 24일");
    expect(html).toContain('href="https://official.example/guide">공식 안내</a>');
    expect(html).toContain("공식 절차 변경");
    expect(html).toContain("신분증입니다.");
    expect(html).toContain('href="/article/next">다음 안내</a>');
    expect(html).toContain('<section aria-labelledby="ip-reader-actions"');
    expect(html.match(/현재 기사 저장/g)).toHaveLength(1);
    expect(html.indexOf("관련 안내")).toBeLessThan(html.indexOf("독자 도구"));
    expect(html.indexOf("독자 도구")).toBeLessThan(
      html.indexOf('data-slot="article-end"'),
    );
    expect(html).not.toMatch(/adsbygoogle|data-ad-|>광고</i);
  });

  it("omits empty and absent article topics", () => {
    const { topics: _topics, ...withoutTopics } = route;
    expect(renderToStaticMarkup(
      <InformationPortalArticle route={{ ...route, topics: [] }} />,
    )).not.toContain("ip-article-topics");
    expect(renderToStaticMarkup(
      <InformationPortalArticle route={withoutTopics} />,
    )).not.toContain("ip-article-topics");
  });

  it.each([null, undefined])("omits reader actions for %s", (readerActions) => {
    const html = renderToStaticMarkup(
      <InformationPortalArticle route={{ ...route, readerActions }} />,
    );

    expect(html).not.toContain("ip-reader-actions");
    expect(html).not.toContain("현재 기사 저장");
  });
});
