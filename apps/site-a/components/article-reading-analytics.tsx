"use client";

import { useEffect, useRef } from "react";

import { emitAnalyticsEvent } from "./analytics-event-dispatcher";

export type ArticleScrollDepth = 25 | 50 | 75 | 90;

const SCROLL_DEPTHS = Object.freeze([25, 50, 75, 90] as const);

export interface ArticleReadingMilestoneState {
  readonly engaged: boolean;
  readonly depths: ReadonlySet<ArticleScrollDepth>;
}

export function getReachedArticleScrollDepths(
  scrollY: number,
  viewportHeight: number,
  documentHeight: number,
): readonly ArticleScrollDepth[] {
  if (
    ![scrollY, viewportHeight, documentHeight].every(Number.isFinite) ||
    scrollY < 0 ||
    viewportHeight <= 0 ||
    documentHeight <= viewportHeight
  ) return [];
  const progress = (scrollY / (documentHeight - viewportHeight)) * 100;
  return SCROLL_DEPTHS.filter((depth) => progress >= depth);
}

export function reportArticleReadingMilestones(
  articleId: string,
  reachedDepths: readonly ArticleScrollDepth[],
  current: ArticleReadingMilestoneState,
  emit: typeof emitAnalyticsEvent = emitAnalyticsEvent,
): ArticleReadingMilestoneState {
  let engaged = current.engaged;
  const depths = new Set(current.depths);
  if (!engaged && reachedDepths.includes(25)) {
    emit({ eventName: "article_engaged", articleId });
    engaged = true;
  }
  for (const depthPercent of reachedDepths) {
    if (depths.has(depthPercent)) continue;
    emit({ eventName: "scroll_depth", articleId, depthPercent });
    depths.add(depthPercent);
  }
  return { engaged, depths };
}

export function ArticleReadingAnalytics({
  articleId,
}: {
  readonly articleId: string;
}) {
  const milestones = useRef<ArticleReadingMilestoneState>({
    engaged: false,
    depths: new Set(),
  });

  useEffect(() => {
    const reportProgress = () => {
      milestones.current = reportArticleReadingMilestones(
        articleId,
        getReachedArticleScrollDepths(
          window.scrollY,
          window.innerHeight,
          document.documentElement.scrollHeight,
        ),
        milestones.current,
      );
    };
    reportProgress();
    window.addEventListener("scroll", reportProgress, { passive: true });
    window.addEventListener("resize", reportProgress);
    return () => {
      window.removeEventListener("scroll", reportProgress);
      window.removeEventListener("resize", reportProgress);
    };
  }, [articleId]);

  return null;
}
