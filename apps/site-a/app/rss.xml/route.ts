import { createRssFeed } from "../../lib/rss-feed";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";

export const dynamic = "force-static";

export function GET() {
  const context = getVersionedSiteReleaseContext();
  return new Response(createRssFeed(context.canonicalOrigin, context.bundle), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
