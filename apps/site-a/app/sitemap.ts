import type { MetadataRoute } from "next";

import { getVersionedSiteReleaseContext } from "../lib/site-release";
import { createSitemapEntries } from "../lib/sitemap";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const context = getVersionedSiteReleaseContext();
  return createSitemapEntries(context.canonicalOrigin, context.bundle);
}
