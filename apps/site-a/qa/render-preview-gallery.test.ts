import { describe, expect, it } from "vitest";

import { renderQaPreviewGallery } from "./render-preview-gallery";
import { QA_QUALITY_VARIANTS } from "./variants";

const cards = QA_QUALITY_VARIANTS.map((variant) => ({
  command: `NO_UPDATE_CHECK=1 pnpm exec serve 'output/${variant.id}'`,
  origin: variant.origin,
  outputLocator: `output/${variant.id}`,
  skin: variant.skin,
  theme: variant.theme,
}));

describe("renderQaPreviewGallery", () => {
  it("renders the exact QA registry as one inert noindex catalog", () => {
    const html = renderQaPreviewGallery(cards);

    expect(html).toContain('<meta name="robots" content="noindex,nofollow,noarchive">');
    expect(html).toContain("QA 비운영 프리뷰 갤러리");
    expect(html).toContain("분석·광고 provider는 꺼져 있고");
    expect(html.match(/PROVIDERS OFF/gu)).toHaveLength(15);
    expect(html.match(/<li><article>/gu)).toHaveLength(15);
    for (const card of cards) {
      expect(html).toContain(`Verified output: <code>${card.outputLocator}</code>`);
      expect(html).toContain(card.command);
      expect(html).toContain(card.origin);
    }
    expect(html).not.toMatch(/<(?:script|iframe|img|link)\b/iu);
    expect(html).not.toMatch(/\bhref\s*=/iu);
    expect(html).not.toMatch(/[?&](?:theme|skin)=/iu);
  });

  it("escapes every registry-derived fact and copied command", () => {
    const html = renderQaPreviewGallery([{
      command: "serve '<unsafe>'",
      origin: "https://qa.example.test/<origin>",
      outputLocator: "output/<site>",
      skin: 'skin"<unsafe>',
      theme: "<script>alert(1)</script>",
    }]);

    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("skin&quot;&lt;unsafe&gt;");
    expect(html).toContain("serve '&lt;unsafe&gt;'");
  });
});
