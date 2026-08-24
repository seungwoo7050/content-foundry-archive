"use client";

import { useSyncExternalStore } from "react";

import { emitAnalyticsEvent } from "./analytics-event-dispatcher";

type BookmarkStorage = Pick<Storage, "getItem" | "setItem">;
type BookmarkState = "bookmarked" | "not-bookmarked" | "unavailable";

const articleIdPattern = /^ART-[A-Z0-9-]+$/;
const siteIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const bookmarkChangeEvent = "content-foundry:article-bookmark-change";

export function articleBookmarkStorageKey(siteId: string): string {
  if (!siteIdPattern.test(siteId)) throw new Error("Invalid bookmark site ID");
  return `content-foundry:${siteId}:article-bookmarks:v1`;
}

export function encodeArticleBookmarks(articleIds: readonly string[]): string {
  if (articleIds.some((id) => !articleIdPattern.test(id))) {
    throw new Error("Invalid bookmark article ID");
  }
  return JSON.stringify({ version: 1, articleIds: [...new Set(articleIds)].sort() });
}

export function decodeArticleBookmarks(raw: string | null): readonly string[] {
  if (raw === null) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return [];
    const record = value as Record<string, unknown>;
    if (
      Object.keys(record).sort().join(",") !== "articleIds,version" ||
      record.version !== 1 || !Array.isArray(record.articleIds) ||
      record.articleIds.some((id) =>
        typeof id !== "string" || !articleIdPattern.test(id))
    ) return [];
    return [...new Set(record.articleIds as string[])].sort();
  } catch {
    return [];
  }
}

export function readArticleBookmark(
  storage: BookmarkStorage, siteId: string, articleId: string,
): BookmarkState {
  try {
    if (!articleIdPattern.test(articleId)) return "unavailable";
    const ids = decodeArticleBookmarks(storage.getItem(articleBookmarkStorageKey(siteId)));
    return ids.includes(articleId) ? "bookmarked" : "not-bookmarked";
  } catch {
    return "unavailable";
  }
}

export function toggleArticleBookmark(
  storage: BookmarkStorage, siteId: string, articleId: string,
): BookmarkState {
  try {
    if (!articleIdPattern.test(articleId)) return "unavailable";
    const key = articleBookmarkStorageKey(siteId);
    const ids = new Set(decodeArticleBookmarks(storage.getItem(key)));
    const next = ids.has(articleId) ? "not-bookmarked" : "bookmarked";
    if (next === "bookmarked") ids.add(articleId); else ids.delete(articleId);
    storage.setItem(key, encodeArticleBookmarks([...ids]));
    return next;
  } catch {
    return "unavailable";
  }
}

export function toggleArticleBookmarkWithAnalytics(
  storage: BookmarkStorage,
  siteId: string,
  articleId: string,
  emit: typeof emitAnalyticsEvent = emitAnalyticsEvent,
): BookmarkState {
  const next = toggleArticleBookmark(storage, siteId, articleId);
  if (next === "bookmarked") {
    emit({ eventName: "bookmark_local", articleId });
  }
  return next;
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(bookmarkChangeEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(bookmarkChangeEvent, listener);
  };
}

function readBrowserBookmark(siteId: string, articleId: string): BookmarkState {
  return readArticleBookmark(window.localStorage, siteId, articleId);
}

export function ArticleBookmark({ siteId, articleId }: {
  readonly siteId: string;
  readonly articleId: string;
}) {
  const state = useSyncExternalStore(
    subscribe,
    () => readBrowserBookmark(siteId, articleId),
    () => "checking",
  );
  const pressed = state === "bookmarked";
  const status = {
    checking: "기사 저장 상태를 확인하고 있습니다.",
    bookmarked: "이 기기에만 기사를 저장했습니다.",
    "not-bookmarked": "이 기기에 저장된 기사가 아닙니다.",
    unavailable: "이 브라우저에서는 기사 저장을 사용할 수 없습니다.",
  }[state];

  function handleClick() {
    try {
      toggleArticleBookmarkWithAnalytics(window.localStorage, siteId, articleId);
    } finally {
      window.dispatchEvent(new Event(bookmarkChangeEvent));
    }
  }

  return <div className="article-bookmark">
    <button type="button" aria-pressed={pressed}
      aria-describedby="article-bookmark-status"
      disabled={state === "checking" || state === "unavailable"}
      onClick={handleClick}>
      {pressed ? "기사 저장 취소" : "기사 저장"}
    </button>
    <p id="article-bookmark-status" role="status" aria-live="polite">{status}</p>
  </div>;
}
