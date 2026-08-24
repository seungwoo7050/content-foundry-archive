import { createReleaseIdentity } from "../../lib/release-identity";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";

export const dynamic = "force-static";

export function GET() {
  const identity = createReleaseIdentity(getVersionedSiteReleaseContext().bundle);

  return Response.json(identity);
}
