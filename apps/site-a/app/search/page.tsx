import type { Metadata } from "next";

import { SearchController } from "../../components/search-controller";
import { createSearchMetadata } from "../../lib/search-metadata";
import { createSearchRouteViewModel } from "../../lib/search-route-view-model";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";

export function generateMetadata(): Metadata {
  return createSearchMetadata(getVersionedSiteReleaseContext());
}

export default function SearchPage() {
  const context = getVersionedSiteReleaseContext();

  return (
    <div className="search-page">
      <header>
        <h1>검색</h1>
        <p>게시된 안내를 검색합니다. 검색어는 외부로 전송하지 않습니다.</p>
      </header>
      <SearchController viewModel={createSearchRouteViewModel(context.bundle)} />
    </div>
  );
}
