import { resolveConsentBuildConfig } from "@content-foundry/site-core";

import { createSiteAdsTxtResponse } from "../../lib/site-ads-txt-response";
import { resolveSiteGoogleCmpConfig } from "../../lib/site-google-cmp-config";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";

export const dynamic = "force-static";

export function GET() {
  const context = getVersionedSiteReleaseContext();
  const publication = resolveSiteGoogleCmpConfig(
    context.config.mode === "production",
    resolveConsentBuildConfig(process.env),
    context.bundle.site.ads,
  );
  return createSiteAdsTxtResponse(publication);
}
