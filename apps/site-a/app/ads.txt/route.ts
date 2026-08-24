import { createSiteAdsTxtResponse } from "../../lib/site-ads-txt-response";
import { resolveSiteProviderConfig } from "../../lib/site-provider-config";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";

export const dynamic = "force-static";

export function GET() {
  const context = getVersionedSiteReleaseContext();
  const providers = resolveSiteProviderConfig(context, process.env);
  return createSiteAdsTxtResponse(providers.cmp);
}
