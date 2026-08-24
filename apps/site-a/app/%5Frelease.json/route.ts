import { createBuildConfigChecksum } from "../../lib/build-config-checksum";
import { createReleaseBuildMetadata } from "../../lib/release-build-metadata";
import { resolveSiteLaunchConfig } from "../../lib/site-launch-config";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";

export const dynamic = "force-static";

export function GET() {
  const context = getVersionedSiteReleaseContext();
  const launch = resolveSiteLaunchConfig(context, process.env);
  const buildConfigChecksum = createBuildConfigChecksum({
    config: context.config,
    launch,
  });
  const metadata = createReleaseBuildMetadata(context.bundle, buildConfigChecksum);

  return Response.json(metadata);
}
