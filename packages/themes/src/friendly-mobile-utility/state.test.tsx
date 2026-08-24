import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { StateRouteViewModel } from "../state-route-view-model.js";
import { renderFriendlyStateRoute } from "./state.js";

const base = (path: string, heading: string) => ({
  path,
  heading,
  description: `${heading} 설명`,
  breadcrumbs: [{ href: path, label: heading }],
});

describe("Friendly Mobile Utility state routes", () => {
  it("keeps the supplied private search client inside a calm panel", () => {
    const route: StateRouteViewModel = {
      ...base("/search", "검색"), kind: "search", client: <form>검색 폼</form>,
    };

    const html = renderToStaticMarkup(renderFriendlyStateRoute(route));

    expect(html).toContain('<section aria-label="사이트 검색" class="fmu-panel"><form>검색 폼</form></section>');
  });

  it.each([
    ["not-found", 404, "/", "홈으로"],
    ["retired", 410, "/archive", "전체 글"],
  ] as const)("renders explicit %s recovery facts", (kind, statusCode, href, label) => {
    const route = {
      ...base(kind === "not-found" ? "/404" : "/retired", label),
      kind,
      statusCode,
      action: { href, label },
    } as StateRouteViewModel;

    const html = renderToStaticMarkup(renderFriendlyStateRoute(route));

    expect(html).toContain(`<p class="fmu-eyebrow">${statusCode}</p>`);
    expect(html).toContain(`class="fmu-action fmu-primary" href="${href}">${label}</a>`);
  });
});
