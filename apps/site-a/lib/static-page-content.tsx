import { VersionedContentBlocks } from "../components/versioned-content-blocks";
import type { PreparedVersionedSiteReleaseContext } from "./load-site-release";
import { findPageByPathSegments } from "./page-route";

export function renderStaticPageContent(
  context: PreparedVersionedSiteReleaseContext,
  pagePath: readonly string[],
) {
  if (context.contractVersion === "3.0.0") {
    const page = findPageByPathSegments(context.bundle, pagePath);
    if (!page) throw new Error("Missing prepared v3 static page");
    return (
      <VersionedContentBlocks
        blocks={page.content}
        context={{
          mediaAssets: context.mediaAssets,
          nicheComponents: context.nicheComponents,
          siteId: context.bundle.release.siteId,
        }}
        contractVersion="3.0.0"
      />
    );
  }

  const page = findPageByPathSegments(context.bundle, pagePath);
  if (!page) throw new Error("Missing prepared v2 static page");
  return (
    <VersionedContentBlocks
      blocks={page.content}
      contractVersion="2.0.0"
      mediaAssets={context.mediaAssets}
    />
  );
}
