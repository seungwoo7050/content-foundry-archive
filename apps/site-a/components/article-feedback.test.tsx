import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ArticleFeedback,
  selectArticleFeedback,
} from "./article-feedback";

describe("article feedback", () => {
  it("selects one private response and permits an explicit deselection", () => {
    expect(selectArticleFeedback(null, "helpful")).toBe("helpful");
    expect(selectArticleFeedback("helpful", "not-helpful")).toBe(
      "not-helpful",
    );
    expect(selectArticleFeedback("helpful", "helpful")).toBeNull();
  });

  it("renders an accessible binary choice without a public comment field", () => {
    const markup = renderToStaticMarkup(<ArticleFeedback />);

    expect(markup).toContain("이 안내가 도움이 되었나요?");
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).toContain("도움됨");
    expect(markup).toContain("도움 안 됨");
    expect(markup).not.toContain("textarea");
    expect(markup).not.toContain("input");
  });
});
