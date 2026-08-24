import { createSearchIndexArtifact } from "../../lib/search-index-artifact";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";

export const dynamic = "force-static";

export function GET() {
  return Response.json(
    createSearchIndexArtifact(getVersionedSiteReleaseContext().bundle),
  );
}
