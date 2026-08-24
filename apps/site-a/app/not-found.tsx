import type { Metadata } from "next";

import { createNotFoundRouteMetadata } from "../lib/not-found-route-metadata";
import { getVersionedSiteReleaseContext } from "../lib/site-release";
import { createNotFoundThemeViewModel } from "../lib/status-theme-view-model";
import { renderThemePage } from "../lib/theme-page";

export function generateMetadata(): Metadata {
  return createNotFoundRouteMetadata();
}

export default function NotFoundPage() {
  const { bundle } = getVersionedSiteReleaseContext();
  return renderThemePage(
    bundle,
    createNotFoundThemeViewModel(bundle),
  );
}
