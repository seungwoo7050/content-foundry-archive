import { getVersionedSiteReleaseContext } from "../lib/site-release";
import { createNotFoundThemeViewModel } from "../lib/status-theme-view-model";
import { renderThemePage } from "../lib/theme-page";

export default function NotFoundPage() {
  const { bundle } = getVersionedSiteReleaseContext();
  return renderThemePage(
    bundle,
    createNotFoundThemeViewModel(bundle),
  );
}
