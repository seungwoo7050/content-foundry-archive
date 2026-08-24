import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentBlocks } from "../../components/content-blocks";
import { createPageMetadata } from "../../lib/page-metadata";
import {
  findPageByPathSegments,
  getPageStaticParams,
} from "../../lib/page-route";
import { getSiteReleaseContext } from "../../lib/site-release";

export const dynamicParams = false;

interface StaticPageProps {
  params: Promise<{ pagePath: string[] }>;
}

export function generateStaticParams() {
  return getPageStaticParams(getSiteReleaseContext().bundle);
}

export async function generateMetadata({
  params,
}: StaticPageProps): Promise<Metadata> {
  const { pagePath } = await params;
  const context = getSiteReleaseContext();
  const page = findPageByPathSegments(context.bundle, pagePath);

  if (!page) {
    notFound();
  }

  return createPageMetadata(context, page);
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { pagePath } = await params;
  const { bundle } = getSiteReleaseContext();
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
      <div className="page-content">
        <ContentBlocks blocks={page.content} />
      </div>
    </article>
  );
}
