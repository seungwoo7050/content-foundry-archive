import { describe, expect, it } from "vitest";

import { hasMeaningfulPublicContent } from "./meaningful-public-content";

describe("meaningful public content", () => {
  it("rejects empty, heading-only, and whitespace-only bodies", () => {
    expect(hasMeaningfulPublicContent([])).toBe(false);
    expect(hasMeaningfulPublicContent([
      { type: "heading", id: "only", level: 2, text: "제목만" },
      { type: "paragraph", markdown: "   " },
      { type: "quote", markdown: "\n", attribution: null },
      { type: "callout", tone: "info", markdown: "\t" },
      { type: "list", ordered: false, items: [" "] },
    ])).toBe(false);
  });

  it.each([
    { type: "paragraph", markdown: "실제 안내" },
    { type: "list", ordered: false, items: ["준비물"] },
    { type: "image", mediaId: "MED-000001" },
    { type: "table", columns: ["항목"], rows: [] },
    { type: "embed", provider: "공식 영상", url: "https://example.com" },
    { type: "gallery", items: [{ mediaId: "MED-000001" }, { mediaId: "MED-000002" }] },
    { type: "code", language: "text", code: "example" },
    { type: "command", shell: "bash", command: "example" },
    { type: "action-link", kind: "internal", label: "신청하기", path: "/apply" },
    { type: "niche-component", componentId: "date", label: "날짜", fallbackText: "날짜를 확인하세요." },
  ])("accepts a visible $type block", (block) => {
    expect(hasMeaningfulPublicContent([block])).toBe(true);
  });
});
