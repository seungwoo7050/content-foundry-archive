"use client";

import { type FormEvent, useRef, useState } from "react";

import {
  SearchFallbackLinks,
  SearchResultList,
} from "./search-result-list";
import type { SearchIndexEntry } from "../lib/search-index-entry";
import { loadSearchIndex } from "../lib/load-search-index";
import { searchIndexEntries, type SearchResult } from "../lib/search-results";
import type { SearchRouteViewModel } from "../lib/search-route-view-model";
import {
  MAX_SEARCH_QUERY_CODE_POINTS,
  tokenizeSearchQuery,
} from "../lib/search-text";

interface SearchControllerProps {
  readonly viewModel: SearchRouteViewModel;
}

type SearchState =
  | { readonly kind: "idle" }
  | { readonly kind: "loading" }
  | { readonly kind: "error" }
  | { readonly kind: "ready"; readonly results: readonly SearchResult[] };

export function SearchController({ viewModel }: SearchControllerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const indexPromiseRef = useRef<Promise<readonly SearchIndexEntry[]> | null>(
    null,
  );
  const requestIdRef = useRef(0);
  const [state, setState] = useState<SearchState>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawQuery = inputRef.current?.value ?? "";
    if (tokenizeSearchQuery(rawQuery, viewModel.locale).length === 0) {
      requestIdRef.current += 1;
      setState({ kind: "idle" });
      return;
    }

    const requestId = ++requestIdRef.current;
    setState({ kind: "loading" });
    try {
      indexPromiseRef.current ??= loadSearchIndex(
        viewModel.searchIndexPath,
        viewModel.release,
        viewModel.locale,
      );
      const entries = await indexPromiseRef.current;
      if (requestId !== requestIdRef.current) return;
      setState({
        kind: "ready",
        results: searchIndexEntries(entries, rawQuery, viewModel.locale),
      });
    } catch {
      indexPromiseRef.current = null;
      if (requestId === requestIdRef.current) setState({ kind: "error" });
    }
  }

  return (
    <div className="search-controller" aria-busy={state.kind === "loading"}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="site-search-query">찾고 싶은 안내</label>
        <input
          id="site-search-query"
          ref={inputRef}
          type="search"
          maxLength={MAX_SEARCH_QUERY_CODE_POINTS}
          autoComplete="off"
          spellCheck={false}
          aria-describedby="site-search-status"
        />
        <button type="submit" disabled={state.kind === "loading"}>
          검색
        </button>
      </form>
      {state.kind === "idle" ? (
        <p id="site-search-status">검색어는 이 기기에서만 처리합니다.</p>
      ) : null}
      {state.kind === "loading" ? (
        <p id="site-search-status" role="status" aria-live="polite">
          검색 색인을 불러오고 있습니다.
        </p>
      ) : null}
      {state.kind === "error" ? (
        <>
          <p id="site-search-status" role="alert">
            검색 색인을 불러오지 못했습니다.
          </p>
          <SearchFallbackLinks categories={viewModel.categories} />
        </>
      ) : null}
      {state.kind === "ready" ? (
        <>
          <p id="site-search-status">검색이 완료되었습니다.</p>
          <SearchResultList
            results={state.results}
            categories={viewModel.categories}
            locale={viewModel.locale}
            timeZone={viewModel.timeZone}
          />
        </>
      ) : null}
      <noscript>
        <div>
          <p>검색을 사용하려면 JavaScript가 필요합니다. 카테고리에서 찾아보세요.</p>
          <SearchFallbackLinks categories={viewModel.categories} />
        </div>
      </noscript>
    </div>
  );
}
