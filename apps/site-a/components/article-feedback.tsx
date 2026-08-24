"use client";

import { useState } from "react";

export type ArticleFeedbackValue = "helpful" | "not-helpful";

export function selectArticleFeedback(
  current: ArticleFeedbackValue | null,
  selected: ArticleFeedbackValue,
): ArticleFeedbackValue | null {
  return current === selected ? null : selected;
}

export function ArticleFeedback() {
  const [feedback, setFeedback] = useState<ArticleFeedbackValue | null>(null);

  function handleSelection(selected: ArticleFeedbackValue) {
    setFeedback((current) => selectArticleFeedback(current, selected));
  }

  return (
    <section
      aria-labelledby="article-feedback-heading"
      className="article-feedback"
    >
      <h2 id="article-feedback-heading">이 안내가 도움이 되었나요?</h2>
      <div role="group" aria-label="안내 평가">
        <button
          aria-pressed={feedback === "helpful"}
          onClick={() => handleSelection("helpful")}
          type="button"
        >
          도움됨
        </button>
        <button
          aria-pressed={feedback === "not-helpful"}
          onClick={() => handleSelection("not-helpful")}
          type="button"
        >
          도움 안 됨
        </button>
      </div>
      <p aria-live="polite">
        {feedback === null ? null : "의견을 남겨 주셔서 감사합니다."}
      </p>
    </section>
  );
}
