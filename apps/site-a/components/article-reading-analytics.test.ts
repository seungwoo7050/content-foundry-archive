import { describe, expect, it, vi } from "vitest";

import {
  getReachedArticleScrollDepths,
  reportArticleReadingMilestones,
  type ArticleReadingMilestoneState,
} from "./article-reading-analytics";

const initial = (): ArticleReadingMilestoneState => ({
  engaged: false,
  depths: new Set(),
});

describe("article reading analytics", () => {
  it("derives fixed depths only from a scrollable document", () => {
    expect(getReachedArticleScrollDepths(0, 800, 2400)).toEqual([]);
    expect(getReachedArticleScrollDepths(400, 800, 2400)).toEqual([25]);
    expect(getReachedArticleScrollDepths(1440, 800, 2400)).toEqual([
      25, 50, 75, 90,
    ]);
    expect(getReachedArticleScrollDepths(0, 800, 800)).toEqual([]);
  });

  it("reports engagement once at 25 percent and each reached depth once", () => {
    const emit = vi.fn(() => true);
    const first = reportArticleReadingMilestones(
      "ART-000123",
      [25, 50],
      initial(),
      emit,
    );
    expect(emit.mock.calls).toEqual([
      [{ eventName: "article_engaged", articleId: "ART-000123" }],
      [{
        eventName: "scroll_depth",
        articleId: "ART-000123",
        depthPercent: 25,
      }],
      [{
        eventName: "scroll_depth",
        articleId: "ART-000123",
        depthPercent: 50,
      }],
    ]);

    reportArticleReadingMilestones(
      "ART-000123",
      [25, 50],
      first,
      emit,
    );
    expect(emit).toHaveBeenCalledTimes(3);
  });
});
