import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { StateRouteViewModel } from "../state-route-view-model.js";
import { renderInformationPortalState } from "./state.js";

const base = (path: string, heading: string) => ({
  path,
  heading,
  description: `${heading} 설명`,
  breadcrumbs: [{ href: path, label: heading }],
});
const recoveryLinks = [
  { kind: "search", href: "/search", label: "검색" },
  { kind: "category", href: "/category/daily-admin", label: "생활·행정" },
  { kind: "replacement", href: "/article/current", label: "최근 안내" },
] as const;

describe("Information Portal state routes", () => {
  it("gives the supplied search client the primary result panel", () => {
    const route: StateRouteViewModel = {
      ...base("/search", "검색"), kind: "search", client: <form>검색 폼</form>,
    };
    const html = renderToStaticMarkup(renderInformationPortalState(route));

    expect(html).toContain('<section aria-label="사이트 검색 결과" class="ip-panel"><form>검색 폼</form></section>');
  });

  it.each([
    { ...base("/404", "찾을 수 없음"), kind: "not-found", statusCode: 404, action: { href: "/", label: "홈으로" }, recoveryLinks },
    { ...base("/retired", "종료된 안내"), kind: "retired", statusCode: 410, action: { href: "/archive", label: "전체 글" }, recoveryLinks },
  ] satisfies readonly StateRouteViewModel[])("renders explicit $statusCode recovery", (route) => {
    const html = renderToStaticMarkup(renderInformationPortalState(route));

    expect(html).toContain(`<p class="ip-code">${route.statusCode}</p>`);
    expect(html).toContain(`class="ip-action" href="${route.action.href}">${route.action.label}</a>`);
    const positions = recoveryLinks.map(({ href }) => html.indexOf(`href="${href}"`));
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect(html).toContain('aria-label="페이지 복구 경로"');
    expect(html).not.toContain('href="/category"');
  });
});
