import { createReleaseIdentity } from "../../lib/release-identity";
import { getSiteReleaseContext } from "../../lib/site-release";

export const dynamic = "force-static";

export function GET() {
  const identity = createReleaseIdentity(getSiteReleaseContext().bundle);

  return Response.json(identity);
}
