import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SKIN_TOKENS } from "../skin.js";
import { FriendlyMobileShell, FriendlyRouteIntro } from "./shell.js";

const shell = {
  locale: "ko-KR",
  skipLink: { href: "#main-content", label: "본문으로 바로가기" },
  brand: { href: "/", label: "생활메모" },
  description: "실생활 정보를 정리합니다.",
  primaryNavigation: [
    {
      link: { href: "/guide", label: "안내" },
      children: [
        { link: { href: "/guide/start", label: "시작" }, children: [] },
      ],
    },
  ],
  footerText: "© 2026 생활메모",
} as const;

const route = {
  kind: "static-page",
  path: "/about",
  heading: "소개",
  description: "운영 방식을 안내합니다.",
  breadcrumbs: [
    { href: "/", label: "홈" },
    { href: "/about", label: "소개" },
  ],
} as const;

describe("Friendly Mobile Utility shell", () => {
  it("renders a compact recursive shell around one landmark main", () => {
    const html = renderToStaticMarkup(
      <FriendlyMobileShell
        context={{ skinId: "calm-blue", colors: SKIN_TOKENS["calm-blue"] }}
        routeKind="static-page"
        shell={shell}
      >
        <FriendlyRouteIntro route={route} />
      </FriendlyMobileShell>,
    );

    expect(html).toContain('data-theme="friendly-mobile-utility"');
    expect(html).toContain('href="#main-content">본문으로 바로가기</a>');
    expect(html).toContain('<main class="fmu-main" data-route-kind="static-page" id="main-content" tabindex="-1">');
    expect(html).toContain('<a href="/guide/start">시작</a>');
    expect(html).toContain('aria-current="page">소개</span>');
    expect(html).toContain('<p>© 2026 생활메모</p>');
    expect(html.match(/<main\b/g)).toHaveLength(1);
  });

});
