import type { Metadata } from "next";

import { SearchController } from "../../components/search-controller";
import { createSearchMetadata } from "../../lib/search-metadata";
import { createSearchRouteViewModel } from "../../lib/search-route-view-model";
import { createSearchThemePageViewModel } from "../../lib/search-theme-page-view-model";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";
import { renderThemePage } from "../../lib/theme-page";

export function generateMetadata(): Metadata {
  return createSearchMetadata(getVersionedSiteReleaseContext());
}

export default function SearchPage() {
  const context = getVersionedSiteReleaseContext();
  const client = (
    <SearchController viewModel={createSearchRouteViewModel(context.bundle)} />
  );
  return renderThemePage(
    context.bundle,
    createSearchThemePageViewModel(context.bundle, client),
  );
}
