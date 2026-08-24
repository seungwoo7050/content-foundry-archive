import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  ArticleFeedback,
  selectArticleFeedback,
  selectArticleFeedbackWithAnalytics,
} from "./article-feedback";

describe("article feedback", () => {
  it("selects one private response and permits an explicit deselection", () => {
    expect(selectArticleFeedback(null, "helpful")).toBe("helpful");
    expect(selectArticleFeedback("helpful", "not-helpful")).toBe(
      "not-helpful",
    );
    expect(selectArticleFeedback("helpful", "helpful")).toBeNull();
  });

  it("records only a selected response with the stable article ID", () => {
    const emit = vi.fn().mockReturnValue(true);

    expect(selectArticleFeedbackWithAnalytics(
      null,
      "helpful",
      "ART-000123",
      emit,
    )).toBe("helpful");
    expect(emit).toHaveBeenCalledWith({
      eventName: "article_feedback",
      articleId: "ART-000123",
      feedback: "helpful",
    });

    expect(selectArticleFeedbackWithAnalytics(
      "helpful",
      "helpful",
      "ART-000123",
      emit,
    )).toBeNull();
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it("renders an accessible binary choice without a public comment field", () => {
    const markup = renderToStaticMarkup(
      <ArticleFeedback articleId="ART-000123" />,
    );

    expect(markup).toContain("이 안내가 도움이 되었나요?");
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).toContain("도움됨");
    expect(markup).toContain("도움 안 됨");
    expect(markup).not.toContain("textarea");
    expect(markup).not.toContain("input");
  });
});
