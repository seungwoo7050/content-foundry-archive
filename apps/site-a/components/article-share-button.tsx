"use client";

import { useState } from "react";

export type ArticleShareResult =
  | "shared"
  | "copied"
  | "cancelled"
  | "unavailable";

export interface ArticleShareTarget {
  readonly share?: (data: { readonly url: string }) => Promise<void>;
  readonly clipboard?: {
    readonly writeText: (value: string) => Promise<void>;
  };
}

function isSafeShareUrl(value: string): boolean {
  const url = URL.parse(value);
  return (
    url !== null &&
    (url.protocol === "https:" || url.protocol === "http:") &&
    url.username.length === 0 &&
    url.password.length === 0
  );
}

export async function requestArticleShare(
  target: ArticleShareTarget,
  canonicalUrl: string,
): Promise<ArticleShareResult> {
  if (!isSafeShareUrl(canonicalUrl)) return "unavailable";

  if (target.share) {
    try {
      await target.share({ url: canonicalUrl });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  try {
    await target.clipboard?.writeText(canonicalUrl);
    return target.clipboard ? "copied" : "unavailable";
  } catch {
    return "unavailable";
  }
}

const RESULT_LABELS: Readonly<Record<ArticleShareResult, string>> = {
  shared: "공유했습니다.",
  copied: "글 주소를 복사했습니다.",
  cancelled: "공유를 취소했습니다.",
  unavailable: "이 브라우저에서는 공유할 수 없습니다.",
};

export function ArticleShareButton({
  canonicalUrl,
}: {
  readonly canonicalUrl: string;
}) {
  const [result, setResult] = useState<ArticleShareResult | null>(null);

  async function handleShare() {
    setResult(await requestArticleShare(navigator, canonicalUrl));
  }

  return (
    <div className="article-share-action">
      <button type="button" onClick={handleShare}>
        공유
      </button>
      <span aria-live="polite">{result ? RESULT_LABELS[result] : null}</span>
    </div>
  );
}
