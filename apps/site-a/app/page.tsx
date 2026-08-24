import { StructuredData } from "../components/structured-data";
import { createHomeThemeViewModel } from "../lib/home-theme-view-model";
import { resolveSiteAdSlots } from "../lib/resolve-site-ad-slots";
import { getVersionedSiteReleaseContext } from "../lib/site-release";
import { renderThemePage } from "../lib/theme-page";
import { createWebsiteStructuredData } from "../lib/website-structured-data";

export default function HomePage() {
  const context = getVersionedSiteReleaseContext();
  const { bundle, canonicalOrigin } = context;
  const route = createHomeThemeViewModel(bundle);

  return (
    <>
      <StructuredData
        value={createWebsiteStructuredData({
          canonicalOrigin,
          site: bundle.site,
        })}
      />
      {renderThemePage(bundle, route, resolveSiteAdSlots(context, process.env))}
    </>
  );
}
