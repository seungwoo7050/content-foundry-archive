import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VersionedContentBlocks } from "../../components/versioned-content-blocks";
import type { VersionedSiteReleaseContext } from "../../lib/load-site-release";
import { createPageMetadata } from "../../lib/page-metadata";
import {
  findPageByPathSegments,
  getPageStaticParams,
} from "../../lib/page-route";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";

export const dynamicParams = false;

interface StaticPageProps {
  params: Promise<{ pagePath: string[] }>;
}

export function generateStaticParams() {
  return getPageStaticParams(getVersionedSiteReleaseContext().bundle);
}

export async function generateMetadata({
  params,
}: StaticPageProps): Promise<Metadata> {
  const { pagePath } = await params;
  const context = getVersionedSiteReleaseContext();
  const page = findPageByPathSegments(context.bundle, pagePath);

  if (!page) {
    notFound();
  }

  return createPageMetadata(context, page);
}

function renderPageContent(
  context: VersionedSiteReleaseContext,
  pagePath: readonly string[],
) {
  if (context.contractVersion === "3.0.0") {
    const page = findPageByPathSegments(context.bundle, pagePath);
    if (!page) notFound();
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
  if (!page) notFound();
  return <VersionedContentBlocks blocks={page.content} contractVersion="2.0.0" />;
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { pagePath } = await params;
  const context = getVersionedSiteReleaseContext();
  const { bundle } = context;
  const page = findPageByPathSegments(bundle, pagePath);

  if (!page) {
    notFound();
  }

  return (
    <article className="static-page">
      <header>
        <h1>{page.title}</h1>
        <p>{page.summary}</p>
      </header>
      <div className="page-content">{renderPageContent(context, pagePath)}</div>
    </article>
  );
}
