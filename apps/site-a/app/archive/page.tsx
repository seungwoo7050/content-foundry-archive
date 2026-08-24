import { createArchiveMetadata } from "../../lib/archive-metadata";
import { createArchiveThemeViewModel } from "../../lib/archive-theme-view-model";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";
import { renderThemePage } from "../../lib/theme-page";

export function generateMetadata() {
  return createArchiveMetadata(getVersionedSiteReleaseContext());
}

export default function ArchivePage() {
  const { bundle } = getVersionedSiteReleaseContext();
  return renderThemePage(bundle, createArchiveThemeViewModel(bundle));
}
