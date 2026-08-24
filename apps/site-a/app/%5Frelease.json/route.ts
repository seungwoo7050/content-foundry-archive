import { createReleaseBuildMetadata } from "../../lib/release-build-metadata";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";

export const dynamic = "force-static";

export function GET() {
  const metadata = createReleaseBuildMetadata(
    getVersionedSiteReleaseContext().bundle,
  );

  return Response.json(metadata);
}
