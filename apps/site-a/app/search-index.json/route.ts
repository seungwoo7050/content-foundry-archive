import { createSearchIndexArtifact } from "../../lib/search-index-artifact";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";

export const dynamic = "force-static";

export function GET() {
  const context = getVersionedSiteReleaseContext();
  return Response.json(
    createSearchIndexArtifact(context.bundle, {
      includeNonIndexable: context.config.noindex,
    }),
  );
}
