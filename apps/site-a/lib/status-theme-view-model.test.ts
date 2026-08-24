import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import {
  createNotFoundThemeViewModel,
  createRetiredThemeViewModel,
} from "./status-theme-view-model";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const article = bundle.articles[0]!;

describe("status theme view models", () => {
  it("projects missing-page facts and only actual release recovery paths", () => {
    const model = createNotFoundThemeViewModel(bundle);

    expect(model).toEqual({
      kind: "not-found",
      path: "/404",
      heading: "페이지를 찾을 수 없습니다",
      description:
        "주소가 바뀌었거나 존재하지 않는 페이지입니다. 생활메모 홈에서 최신 안내를 확인해 주세요.",
      breadcrumbs: [
        { href: "/", label: "생활메모" },
        { href: "/404", label: "페이지를 찾을 수 없습니다" },
      ],
      statusCode: 404,
      action: { href: "/", label: "생활메모 홈으로 돌아가기" },
      recoveryLinks: [
        { kind: "search", href: "/search", label: "사이트 검색" },
        {
          kind: "category",
          href: "/category/daily-admin",
          label: "생활·행정",
        },
        {
          kind: "replacement",
          href: "/article/government24-resident-registration-guide",
          label: "최근 안내: 정부24 주민등록등본 발급 방법",
        },
      ],
    });
    expect(model.recoveryLinks?.map(({ href }) => href)).not.toContain("/category");
  });

  it("uses an explicit retired replacement once and adds other recovery", () => {
    expect(createRetiredThemeViewModel(bundle, {
      type: "gone",
      path: "/old-guide",
      status: 410,
      replacementPath: article.seo.canonicalPath,
    })).toMatchObject({
      kind: "retired",
      path: "/old-guide",
      description: "/old-guide 주소의 콘텐츠는 더 이상 제공하지 않습니다.",
      statusCode: 410,
      action: {
        href: "/article/government24-resident-registration-guide",
        label: "대신 볼 수 있는 안내로 이동",
      },
      recoveryLinks: [
        { kind: "search", href: "/search", label: "사이트 검색" },
        {
          kind: "category",
          href: "/category/daily-admin",
          label: "생활·행정",
        },
      ],
    });
  });

  it("selects at most one recent article by update and stable id", () => {
    const model = createNotFoundThemeViewModel({
      ...bundle,
      site: { ...bundle.site, search: { enabled: false } },
      taxonomy: { ...bundle.taxonomy, categories: [] },
      articles: [
        {
          ...article,
          id: "ART-B",
          updatedAt: "2026-08-25T00:00:00Z",
          seo: { ...article.seo, canonicalPath: "/article/b" },
        },
        {
          ...article,
          id: "ART-A",
          updatedAt: "2026-08-25T00:00:00Z",
          seo: { ...article.seo, canonicalPath: "/article/a" },
        },
      ],
    });

    expect(model.recoveryLinks).toEqual([
      { kind: "replacement", href: "/article/a", label: `최근 안내: ${article.title}` },
    ]);
  });

  it("falls back to the archive without inventing a replacement", () => {
    const model = createRetiredThemeViewModel(bundle, {
      type: "gone",
      path: "/retired",
      status: 410,
      replacementPath: null,
    });

    expect(model.action).toEqual({ href: "/archive", label: "전체 글 보기" });
    expect(model.breadcrumbs.at(-1)).toEqual({
      href: "/retired",
      label: "더 이상 제공하지 않는 페이지입니다",
    });
    expect(model).not.toHaveProperty("replacementPath");
    expect(model.recoveryLinks?.map(({ href }) => href)).toEqual([
      "/search",
      "/category/daily-admin",
      "/article/government24-resident-registration-guide",
    ]);
  });
});
