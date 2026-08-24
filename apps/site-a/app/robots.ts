import type { MetadataRoute } from "next";

import { createRobotsPolicy } from "../lib/robots-policy";
import { getVersionedSiteReleaseContext } from "../lib/site-release";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const context = getVersionedSiteReleaseContext();
  return createRobotsPolicy(context.canonicalOrigin, context.config);
}
