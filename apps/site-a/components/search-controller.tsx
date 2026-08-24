"use client";

import type { SearchRouteViewModel } from "../lib/search-route-view-model";
import { MAX_SEARCH_QUERY_CODE_POINTS } from "../lib/search-text";

interface SearchControllerProps {
  readonly viewModel: SearchRouteViewModel;
}

export function SearchController({ viewModel }: SearchControllerProps) {
  return (
    <div className="search-controller">
      <form>
        <label htmlFor="site-search-query">찾고 싶은 안내</label>
        <input
          id="site-search-query"
          type="search"
          maxLength={MAX_SEARCH_QUERY_CODE_POINTS}
          autoComplete="off"
          spellCheck={false}
          aria-describedby="site-search-status"
        />
        <button type="submit">검색</button>
      </form>
      <p id="site-search-status">검색어는 이 기기에서만 처리합니다.</p>
      <noscript>
        <div>
          <p>검색을 사용하려면 JavaScript가 필요합니다. 카테고리에서 찾아보세요.</p>
          <ul>
            {viewModel.categories.map((category) => (
              <li key={category.id}>
                <a href={category.href}>{category.label}</a>
              </li>
            ))}
            <li>
              {/* Static export intentionally uses native navigation. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/archive">전체 글 보기</a>
            </li>
          </ul>
        </div>
      </noscript>
    </div>
  );
}
