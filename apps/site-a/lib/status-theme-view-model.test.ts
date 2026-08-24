import { describe, expect, it } from "vitest";

import {
  createNotFoundThemeViewModel,
  createRetiredThemeViewModel,
} from "./status-theme-view-model";

const bundle = { site: { name: "생활메모" } };

describe("status theme view models", () => {
  it("projects the static missing-page facts and home recovery", () => {
    expect(createNotFoundThemeViewModel(bundle)).toEqual({
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
    });
  });

  it("uses an explicit retired replacement when one exists", () => {
    expect(createRetiredThemeViewModel(bundle, {
      type: "gone",
      path: "/old-guide",
      status: 410,
      replacementPath: "/article/current-guide",
    })).toMatchObject({
      kind: "retired",
      path: "/old-guide",
      description: "/old-guide 주소의 콘텐츠는 더 이상 제공하지 않습니다.",
      statusCode: 410,
      action: {
        href: "/article/current-guide",
        label: "대신 볼 수 있는 안내로 이동",
      },
    });
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
  });
});
