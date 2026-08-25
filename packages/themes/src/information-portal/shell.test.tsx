import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { SiteShellViewModel } from "../presentation-view-model.js";
import { SKIN_TOKENS } from "../skin.js";
import { InformationPortalShell, PortalRouteIntro } from "./shell.js";

const shell = {
  locale: "ko-KR",
  skipLink: { href: "#main-content", label: "본문으로 바로가기" },
  brand: { href: "/", label: "생활메모" },
  description: "실생활 정보를 정리합니다.",
  searchLink: { href: "/search", label: "사이트 검색" },
  primaryNavigation: [{
    link: { href: "/category/life", label: "생활" },
    children: [{ link: { href: "/category/life/apply", label: "신청" }, children: [] }],
  }],
  footerText: "© 2026 생활메모",
} as const;
const route = {
  kind: "static-page",
  path: "/about",
  heading: "소개",
  description: "운영 원칙",
  breadcrumbs: [{ href: "/", label: "홈" }, { href: "/about", label: "소개" }],
} as const;

describe("Information Portal shell", () => {
  it("renders a wide masthead, recursive directory navigation, and one main", () => {
    const html = renderToStaticMarkup(
      <InformationPortalShell
        context={{ skinId: "calm-blue", colors: SKIN_TOKENS["calm-blue"] }}
        routeKind="static-page"
        routePath="/category/life/apply"
        shell={shell}
      >
        <PortalRouteIntro route={route} />
      </InformationPortalShell>,
    );

    expect(html).toContain('data-theme="information-portal"');
    expect(html).toContain('class="ip-brand-row"');
    expect(html).toContain(
      '<a class="ip-masthead-search" href="/search">사이트 검색</a>',
    );
    expect(html).toContain('<div class="ip-nav-wide">');
    expect(html).toContain(
      '<details class="ip-menu"><summary>메뉴</summary><div class="ip-nav-mobile">',
    );
    expect(html).toContain(
      '<a aria-current="page" href="/category/life/apply">신청</a>',
    );
    expect(html).toContain('<a href="/category/life">생활</a>');
    expect(html).toContain(
      '<main class="ip-main" data-route-kind="static-page" id="main-content" tabindex="-1">',
    );
    expect(html).toContain('aria-current="page">소개</span>');
    expect(html).toContain("© 2026 생활메모");
    expect(html.match(/<main\b/g)).toHaveLength(1);
  });

  it("omits the masthead search entry when release control is absent", () => {
    const { searchLink: _searchLink, ...withoutSearchLink } = shell;
    const render = (shellModel: SiteShellViewModel) =>
      renderToStaticMarkup(
        <InformationPortalShell
          context={{ skinId: "calm-blue", colors: SKIN_TOKENS["calm-blue"] }}
          routeKind="static-page"
          routePath="/about"
          shell={shellModel}
        >
          <PortalRouteIntro route={route} />
        </InformationPortalShell>,
      );
    const masthead = (html: string) => html.match(
      /<header class="ip-masthead">[\s\S]*?<\/header>/,
    )?.[0];

    expect(masthead(render(withoutSearchLink))).not.toContain(
      "ip-masthead-search",
    );
    expect(masthead(render({ ...shell, searchLink: null }))).not.toContain(
      "ip-masthead-search",
    );
  });
});
