import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SKIN_IDS, SKIN_TOKENS } from "../skin.js";
import { MinimalKnowledgeBaseShell } from "./shell.js";
import { MINIMAL_KNOWLEDGE_BASE_STYLES } from "./styles.js";

const shell = {
  locale: "ko-KR",
  skipLink: { href: "#main-content", label: "본문으로 바로가기" },
  brand: { href: "/", label: "생활메모" },
  description: "실생활 안내를 정리합니다.",
  primaryNavigation: [],
  footerText: "© 2026 생활메모",
} as const;

describe("Minimal Knowledge Base styles", () => {
  it.each(SKIN_IDS)("binds every %s semantic skin", (skinId) => {
    const html = renderToStaticMarkup(
      <MinimalKnowledgeBaseShell
        context={{ skinId, colors: SKIN_TOKENS[skinId] }}
        shell={shell}
      >
        <p>본문</p>
      </MinimalKnowledgeBaseShell>,
    );

    expect(html).toContain(`data-skin="${skinId}"`);
    for (const color of Object.values(SKIN_TOKENS[skinId])) {
      expect(html).toContain(color);
    }
    expect(html).toContain("grid-template-columns:16rem minmax(0,1fr)");
    expect(html).toContain("overflow-x:auto");
  });

  it("keeps knowledge-base CSS structural and claim free", () => {
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain("min-height:100vh");
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain("scroll-margin-top:1rem");
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).not.toMatch(
      /ranking|popular|reading.?time|verified|newsletter|save/i,
    );
  });
});
