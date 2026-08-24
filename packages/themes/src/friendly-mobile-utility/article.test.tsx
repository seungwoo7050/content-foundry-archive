import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ArticleRouteViewModel } from "../content-route-view-model.js";
import { FriendlyArticle } from "./article.js";

const route: ArticleRouteViewModel = {
  kind: "article",
  path: "/article/start",
  heading: "신청 안내",
  description: "필요한 절차를 정리합니다.",
  breadcrumbs: [{ href: "/article/start", label: "신청 안내" }],
  category: { href: "/category/life", label: "생활" },
  authorLabel: "작성자",
  operatorLabel: "운영자",
  published: { dateTime: "2026-08-20T00:00:00Z", label: "2026년 8월 20일" },
  updated: null,
  trustLinks: [{ href: "/about", label: "운영 방식" }],
  toc: [{ id: "step", label: "신청 단계", level: 2 }],
  sources: [{ label: "공식 안내", href: null }],
  updateTriggers: ["공식 절차 변경"],
  faq: [{ question: "무엇이 필요한가요?", answer: "신분증입니다." }],
  relatedSectionHeading: "관련 안내",
  relatedArticles: [],
  advertisingEligible: true,
  readerActions: <button type="button">현재 기사 저장</button>,
  hero: <figure>대표 이미지</figure>,
  body: <section id="step">신청 본문</section>,
};

describe("Friendly Mobile Utility article", () => {
  it("renders trust, visible TOC, body, and evidence without inventing ads", () => {
    const html = renderToStaticMarkup(<FriendlyArticle route={route} />);

    expect(html).toContain("이 글에서 확인할 내용");
    expect(html).toContain('<time dateTime="2026-08-20T00:00:00Z">2026년 8월 20일</time>');
    expect(html).toContain('href="#step">신청 단계</a>');
    expect(html).toContain("신청 본문");
    expect(html).toContain("공식 안내");
    expect(html).toContain("공식 절차 변경");
    expect(html).toContain("신분증입니다.");
    expect(html).toContain('<section aria-labelledby="fmu-reader-actions"');
    expect(html.match(/현재 기사 저장/g)).toHaveLength(1);
    expect(html.indexOf("신청 본문")).toBeLessThan(html.indexOf("독자 도구"));
    expect(html).not.toMatch(/adsbygoogle|data-ad-|>광고</i);
  });

  it.each([null, undefined])("omits reader actions for %s", (readerActions) => {
    const html = renderToStaticMarkup(
      <FriendlyArticle route={{ ...route, readerActions }} />,
    );

    expect(html).not.toContain("fmu-reader-actions");
    expect(html).not.toContain("현재 기사 저장");
  });
});
